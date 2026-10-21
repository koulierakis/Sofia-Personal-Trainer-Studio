"""Local ComfyUI runner: run beside ComfyUI, export ZIP for cloud intake."""
import argparse, hashlib, json, pathlib, time, urllib.request, urllib.parse, uuid, zipfile
from library import read, write, inspect

def request(endpoint, route, data=None, binary=False):
    req=urllib.request.Request(endpoint+route,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=30) as r:
        b=r.read(8*1024*1024+1)
        if len(b)>8*1024*1024: raise ValueError('Response too large')
        return b if binary else json.loads(b)

def workflow_validate(workflow, objects):
    if not isinstance(workflow,dict) or not workflow: raise ValueError('Supply API-format workflow, not UI graph')
    for key,node in workflow.items():
        if not isinstance(node,dict) or node.get('class_type') not in objects or not isinstance(node.get('inputs'),dict): raise ValueError('Unknown workflow node '+key)
    if not any(node['class_type']=='SaveImage' for node in workflow.values()): raise ValueError('Workflow must include SaveImage')

def run(args):
    endpoint=args.endpoint.rstrip('/'); u=urllib.parse.urlparse(endpoint)
    if u.scheme!='http' or u.hostname not in ('127.0.0.1','localhost','::1') or u.username or u.password or u.path or u.query: raise ValueError('Run this runner on the ComfyUI machine using a loopback HTTP endpoint; do not expose ComfyUI publicly')
    request(endpoint,'/system_stats'); objects=request(endpoint,'/object_info'); template=read(args.workflow); workflow_validate(template,objects)
    queue=read(args.queue)['jobs']; state_path=pathlib.Path(args.output)/'jobs.json'; state=read(state_path) if state_path.exists() else {}; state_path.parent.mkdir(parents=True,exist_ok=True)
    submitted=0; exports=[]
    for job in queue:
        if job['action']!='generate': continue
        if submitted>=args.limit: break
        prompt=job['specification'].get('prompt')
        if not prompt: raise ValueError('Missing exact phase prompt; coach must author it')
        if 'SOFIA_PROMPT' not in json.dumps(template): raise ValueError('Workflow requires SOFIA_PROMPT placeholder')
        # Replace only whole string placeholders, preserving quotes and Greek text safely.
        def replace(v):
            if isinstance(v,dict): return {k:replace(x) for k,x in v.items()}
            if isinstance(v,list): return [replace(x) for x in v]
            return prompt if v=='SOFIA_PROMPT' else v
        workflow=replace(template)
        key=hashlib.sha256(json.dumps([job['exerciseId'],job['phase'],workflow],sort_keys=True).encode()).hexdigest()
        record=state.get(key,{})
        if record.get('status')=='complete':
            exports.append(record['export']); continue
        if record.get('status')=='submitting': raise ValueError('Ambiguous submission: reconcile ComfyUI history/queue before clearing job '+key)
        if record.get('status')=='failed':
            if not args.retry_failed: continue
            record={}
        if not record.get('prompt_id'):
            record={'status':'submitting','exerciseId':job['exerciseId'],'phase':job['phase']}; state[key]=record; write(state_path,state)
            # Persist uncertainty before POST; never blindly retry a timed-out POST.
            response=request(endpoint,'/prompt',{'prompt':workflow,'client_id':str(uuid.uuid4()),'extra_data':{'sofiaExerciseId':job['exerciseId'],'sofiaPhase':job['phase'],'jobKey':key}})
            if response.get('node_errors'): raise ValueError('ComfyUI node validation failed: '+json.dumps(response['node_errors']))
            record.update(prompt_id=response['prompt_id'],status='submitted'); write(state_path,state)
        submitted+=1; deadline=time.monotonic()+args.timeout
        while time.monotonic()<deadline:
            history=request(endpoint,'/history/'+urllib.parse.quote(record['prompt_id'])).get(record['prompt_id'])
            if history:
                if history.get('status',{}).get('status_str')=='error':
                    record['status']='failed'; write(state_path,state); raise ValueError('ComfyUI execution failed; use --retry-failed after correction')
                if history.get('status',{}).get('completed'): break
            print(job['exerciseId'],job['phase'],'waiting',flush=True); time.sleep(2)
        else: raise TimeoutError('Job retained for resume; no resubmission')
        outputs=[im for node in history['outputs'].values() for im in node.get('images',[]) if im.get('type')=='output']
        if len(outputs)!=1: raise ValueError('Exactly one output image per phase required')
        im=outputs[0]; b=request(endpoint,'/view?'+urllib.parse.urlencode({k:im[k] for k in ('filename','subfolder','type')}),binary=True); info=inspect(b)
        name=key+'.'+info['format'].lower(); (state_path.parent/name).write_bytes(b)
        row={'file':name,'sha256':info['sha256'],'sofiaExerciseId':job['exerciseId'],'sofiaPhase':job['phase'],'sourceExerciseId':job['exerciseId'],'sourcePhase':job['phase'],'provider':'ComfyUI','mappingReview':'pending','mappingReviewer':None}
        record.update(status='complete',export=row); write(state_path,state); exports.append(row)
    write(state_path.parent/'mapping.json',{'version':1,'images':exports})
    with zipfile.ZipFile(state_path.parent/'export.zip','w',zipfile.ZIP_DEFLATED) as z:
        z.write(state_path.parent/'mapping.json','mapping.json')
        for row in exports: z.write(state_path.parent/row['file'],row['file'])
    print('Export ready for explicit mapping review and images:import; no automatic coach approval.')

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--endpoint',default='http://127.0.0.1:8188'); p.add_argument('--workflow',required=True); p.add_argument('--queue',default='docs/production-queue.json'); p.add_argument('--output',default='.image-production'); p.add_argument('--limit',type=int,default=1); p.add_argument('--timeout',type=int,default=600); p.add_argument('--retry-failed',action='store_true'); run(p.parse_args())
