"""Offline image intake. Untrusted exports never assign exercise identities implicitly."""
import argparse, contextlib, hashlib, io, json, os, pathlib, subprocess, tempfile, zipfile
from PIL import Image, ImageStat
from reference_lock import profile_for, validate_reference, locked_prompt
ROOT = pathlib.Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
MANIFEST = PUBLIC / 'data/exercise-images.json'
MAX_BYTES = 8 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 24_000_000

def digest(b): return hashlib.sha256(b).hexdigest()
def read(p): return json.loads(pathlib.Path(p).read_text())
def write(p, d):
    p=pathlib.Path(p); p.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile(mode='w',dir=p.parent,delete=False) as f:
        json.dump(d,f,ensure_ascii=False,indent=2); f.write('\n'); name=f.name
    os.replace(name,p)
def catalog():
    xs=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/image-catalog.mjs')],cwd=ROOT))
    if len({x['id'] for x in xs}) != len(xs): raise ValueError('Duplicate catalog IDs')
    return {x['id']:x for x in xs}
def inspect(b):
    if not 0<len(b)<=MAX_BYTES: raise ValueError('Image exceeds 8 MiB or is empty')
    if not (b.startswith(b'\x89PNG\r\n\x1a\n') or b.startswith(b'\xff\xd8\xff') or (b[:4]==b'RIFF' and b[8:12]==b'WEBP')): raise ValueError('Invalid signature')
    with Image.open(io.BytesIO(b)) as im:
        fmt=im.format; im.verify()
    with Image.open(io.BytesIO(b)) as im:
        im.load()
        if fmt not in ('PNG','JPEG','WEBP') or getattr(im,'n_frames',1)!=1: raise ValueError('Unsupported format or animation')
        if min(im.size)<256 or max(im.size)>8192: raise ValueError('Invalid dimensions')
        if max(ImageStat.Stat(im.convert('RGB')).stddev)<3: raise ValueError('Blank image')
        return {'width':im.width,'height':im.height,'format':fmt,'sha256':digest(b),'bytes':len(b)}
def local_url(url):
    if not isinstance(url,str) or not url.startswith('/images/exercises/'): raise ValueError('Invalid image URL')
    p=(PUBLIC/url.lstrip('/')).resolve()
    if not p.is_relative_to((PUBLIC/'images/exercises').resolve()): raise ValueError('Unsafe asset path')
    return p

def audit(out):
    cats=catalog(); manifest=read(MANIFEST); hashes={}; assets={}; errors=[]
    for p in sorted((PUBLIC/'images/exercises').rglob('*')):
        if not p.is_file(): continue
        url='/'+p.relative_to(PUBLIC).as_posix()
        try:
            info=inspect(p.read_bytes()); assets[url]=info
            hashes.setdefault(info['sha256'],[]).append(url)
        except Exception as e: errors.append({'path':url,'error':str(e)})
    duplicates=[v for v in hashes.values() if len(v)>1]; duplicate_urls={u for v in duplicates for u in v}
    records=[]; queue=[]
    for id,e in cats.items():
        entry=manifest['exercises'].get(id,{}); frames=e['productionFrames']; phases=entry.get('phases',[])
        profile=profile_for(e); reference=validate_reference(PUBLIC,profile); reference_sha256=digest(reference.read_bytes()); reference_url='/images/athletes/'+reference.name
        # The authored exercise sequence is authoritative. Legacy image phases
        # beyond it stay in storage but are not exposed as movement frames.
        count=len(frames); details=[]; invalid=[]
        for i in range(count):
            frame=dict(frames[i]) if i<len(frames) else {}
            reuse=frame.get('sameImageAs')
            source_phase=reuse if type(reuse) is int and 1 <= reuse <= count else i+1
            source_index=source_phase-1
            url=phases[source_index] if source_index<len(phases) else None
            blocked=entry.get('blockedPhases',{}).get(str(i+1))
            valid=bool(url and url in assets and url.startswith('/images/exercises/'+id+'/') and url not in duplicate_urls and not blocked)
            if url and not valid and not blocked: invalid.append(url)
            reviewed=entry.get('phaseReviews',{}).get(str(source_phase),{})
            approved=valid and reviewed.get('status')=='approved' and reviewed.get('sha256')==assets[url]['sha256'] and bool(reviewed.get('reviewer'))
            imported=[c for c in entry.get('importedCandidates',[]) if c['phase']==source_phase and c['url'] in assets and c.get('reviewStatus')!='rejected']
            state='approved' if approved else 'rejected' if blocked else 'pending_human_review' if valid or imported else 'missing'
            exact_label=entry.get('labels',[])[i] if i<len(entry.get('labels',[])) else frame.get('label')
            authored_prompt=frame.get('prompt')
            frame['draftPrompt']=None
            frame['prompt']=authored_prompt if authored_prompt and 'MANDATORY SOFIA VISUAL REFERENCE LOCK' in authored_prompt and reference_sha256 in authored_prompt else locked_prompt(profile)+f' Exercise: {e["name"]}. Exact source image phase: {exact_label or frame.get("label")}. Equipment: {e.get("equipment")}. Source instructions: {e.get("instructions")}. One full-body athlete, safe mechanics. No panels or watermark. Coach review required.'
            frame['referenceProfile']=profile;frame['reference'] = reference_url;frame['referenceSha256']=reference_sha256
            details.append({'phase':i+1,'label':frame.get('label'),'url':url,'state':state,'technicalValid':valid,'reason':blocked,'humanReviewRequired':not approved,'importedCandidates':[c['url'] for c in imported],'sameImageAs':reuse})
            # Closing frames reuse their source frame and are never separately generated.
            if not approved and not reuse:
                queue.append({'exerciseId':id,'name':e['name'],'phase':i+1,'action':'human_review' if valid or imported else 'generate','status':'awaiting_human_review' if valid or imported else 'queued','reuseImageFromPhase':None,'existingUrl':url,'candidateUrls':[c['url'] for c in imported],'reason':blocked,'equipment':e.get('equipment'),'instructions':e.get('instructions'), 'specification':frame,'referenceProfile':profile,'reference':reference_url,'referenceSha256':reference_sha256,'requiresCoachReview':True})
        status='INVALID_MAPPING' if invalid else 'COMPLETE_VERIFIED' if all(p['state']=='approved' for p in details) else 'REJECTED_IMAGES' if any(p['state']=='rejected' for p in details) else 'PARTIALLY_COMPLETE' if any(p['technicalValid'] or p['importedCandidates'] for p in details) else 'MISSING_IMAGES'
        records.append({'id':id,'name':e['name'],'concept':bool(e.get('requiresCoachReview')),'status':status,'requiredPhases':count,'phases':details,'invalidMappings':invalid})
    for id,entry in manifest['exercises'].items():
        urls=entry.get('candidates',[])+entry.get('additionalReviewCandidates',[])+[c['url'] for c in entry.get('importedCandidates',[])]
        for url in urls:
            if url not in assets: errors.append({'id':id,'path':url,'error':'Missing or invalid candidate'})
        if id not in cats: errors.append({'id':id,'error':'Unknown manifest ID'})
    programs=read(PUBLIC/'data/functional-programs.json'); import re
    refs=[id for p in programs for b in p['blocks'] for id in re.findall(r'\bfunctional-\d{3}\b',b['activity'])]
    for id in refs:
        if id not in cats: errors.append({'id':id,'error':'Unknown program reference'})
    report={'version':1,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'exerciseCount':len(cats),'programCount':len(programs),'programReferences':len(refs),'assetCount':len(assets),'assets':assets,'duplicateGroups':duplicates,'errors':errors,'exercises':records,'note':'Technical validity is not biomechanical approval. Browser-local reviews are unavailable here. Draft storyboard phases require coach review.'}
    write(out,report); write(pathlib.Path(out).with_name('production-queue.json'),{'version':1,'jobs':queue})
    print(json.dumps({'exerciseCount':len(cats),'assetCount':len(assets),'errors':len(errors),'duplicateGroups':len(duplicates),'statuses':{s:sum(x['status']==s for x in records) for s in sorted({x['status'] for x in records})},'queued':len(queue)}))
    return report

def import_export(source, mapping_path, dry=False):
    """Prevalidate entire batch, append immutable assets, then atomically replace manifest."""
    cats=catalog(); mapping=read(mapping_path)
    if mapping.get('version')!=1 or not isinstance(mapping.get('images'),list) or not mapping['images']: raise ValueError('Invalid mapping manifest')
    with contextlib.ExitStack() as stack:
        source=pathlib.Path(source).resolve()
        if source.is_file():
            archive=stack.enter_context(zipfile.ZipFile(source)); names=archive.namelist()
            if len(names)!=len(set(names)) or len(names)>2000: raise ValueError('Duplicate ZIP names or oversized archive')
            for z in archive.infolist():
                if pathlib.PurePosixPath(z.filename).is_absolute() or '..' in pathlib.PurePosixPath(z.filename).parts or '\\' in z.filename or (z.external_attr>>16)&0o170000==0o120000: raise ValueError('Unsafe ZIP member')
                if z.file_size>MAX_BYTES: raise ValueError('Oversized ZIP member')
            def get(name): return archive.read(name)
        else:
            def get(name):
                p=(source/name).resolve()
                if not p.is_relative_to(source): raise ValueError('Unsafe source path')
                if p.stat().st_size>MAX_BYTES: raise ValueError('Oversized input')
                return p.read_bytes()
        manifest=read(MANIFEST); original=MANIFEST.read_bytes(); pending=[]; pairs=set(); hashes=set()
        for p in (PUBLIC/'images/exercises').rglob('*.webp'): hashes.add(digest(p.read_bytes()))
        for row in mapping['images']:
            id=row['sofiaExerciseId']; phase=row['sofiaPhase']; key=(id,phase)
            if id not in cats or type(phase)!=int or not 1<=phase<=max(len(cats[id]['productionFrames']),len(manifest['exercises'].get(id,{}).get('phases',[]))): raise ValueError('Unknown exercise or phase')
            if key in pairs: raise ValueError('Duplicate target phase')
            pairs.add(key)
            if row.get('mappingReview')!='approved' or not row.get('mappingReviewer') or not row.get('sourceExerciseId') or not row.get('provider') or row.get('sourcePhase') is None: raise ValueError('Explicit reviewed source mapping and provenance required')
            name=row['file']
            if pathlib.PurePosixPath(name).is_absolute() or '..' in pathlib.PurePosixPath(name).parts or '\\' in name: raise ValueError('Unsafe filename')
            b=get(name); info=inspect(b)
            if info['sha256']!=row.get('sha256'): raise ValueError('Input hash mismatch')
            if info['sha256'] in hashes: raise ValueError('Duplicate input image')
            with Image.open(io.BytesIO(b)) as im:
                out=io.BytesIO(); im.convert('RGB').save(out,format='WEBP',quality=88,method=6); output=out.getvalue()
            output_info=inspect(output)
            if output_info['sha256'] in hashes: raise ValueError('Duplicate output image')
            hashes.update([info['sha256'],output_info['sha256']])
            # Never overwrite existing imagery, even when replacing a rejected phase.
            url=f'/images/exercises/{id}/{phase:02d}-{output_info["sha256"][:16]}.webp'
            if local_url(url).exists(): raise ValueError('Asset collision')
            entry=manifest['exercises'].setdefault(id,{'status':'pending_visual_review','phases':[None]*len(cats[id]['productionFrames']),'candidates':[],'blockedPhases':{}})
            entry.setdefault('phases',[])
            entry['phases'] += [None] * max(0, len(cats[id]['productionFrames']) - len(entry['phases']))
            entry.setdefault('importedCandidates',[]).append({'phase':phase,'url':url,'sourceExerciseId':row['sourceExerciseId'],'sourcePhase':row.get('sourcePhase'),'provider':row['provider'],'sourceSha256':info['sha256'],'sha256':output_info['sha256'],'mappingReviewer':row['mappingReviewer'],'reviewStatus':'pending_visual_review'})
            # Promotion is a separate coach decision. Imports are review candidates only.
            pending.append((local_url(url),output))
        if dry: return len(pending)
        lock=ROOT/'.image-import.lock'
        fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
        created=[]
        try:
            if MANIFEST.read_bytes()!=original: raise ValueError('Manifest changed during import')
            for p,b in pending:
                p.parent.mkdir(parents=True,exist_ok=True)
                with p.open('xb') as f: f.write(b)
                created.append(p)
            write(MANIFEST,manifest)
        except Exception:
            for p in created: p.unlink()
            raise
        finally: os.close(fd); lock.unlink()
        return len(pending)

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('command',choices=['audit','validate','import']); parser.add_argument('--output',default=str(ROOT/'docs/image-audit.json')); parser.add_argument('--source'); parser.add_argument('--mapping'); parser.add_argument('--dry-run',action='store_true'); args=parser.parse_args()
    if args.command=='import': print('Imported candidates:',import_export(args.source,args.mapping,args.dry_run))
    else:
        r=audit(args.output)
        if args.command=='validate' and (r['errors'] or r['duplicateGroups'] or any(x['invalidMappings'] for x in r['exercises'])): raise SystemExit(1)
