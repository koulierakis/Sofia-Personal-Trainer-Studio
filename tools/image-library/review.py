"""Persist an explicit coach decision bound to immutable image bytes."""
import argparse, os
from library import ROOT, MANIFEST, read, write, local_url, inspect

def review(id,phase,url,status,reviewer,notes):
    if not reviewer.strip() or not notes.strip(): raise ValueError('Reviewer identity and assessment required')
    lock=ROOT/'.image-import.lock'; fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY)
    try:
        m=read(MANIFEST); e=m['exercises'][id]
        candidates=e.get('candidates',[])+e.get('additionalReviewCandidates',[])+[x['url'] for x in e.get('importedCandidates',[]) if x['phase']==phase]
        if url not in candidates or not url.startswith('/images/exercises/'+id+'/') or not 1<=phase<=len(e['phases']): raise ValueError('Unknown exact exercise/phase candidate')
        info=inspect(local_url(url).read_bytes())
        # Historical candidate filenames bind to phase; never reinterpret by list order.
        if int(local_url(url).name.split('-')[0].split('.')[0])!=phase: raise ValueError('Candidate belongs to another phase')
        previous=e.get('phaseReviews',{}).get(str(phase),{})
        if previous.get('status')=='approved' and previous.get('url')!=url: raise ValueError('Existing approved phase requires a separate explicit replacement decision')
        e.setdefault('phaseReviews',{})[str(phase)]={'status':status,'reviewer':reviewer,'notes':notes,'sha256':info['sha256'],'url':url}
        if status=='approved':
            current=e['phases'][phase-1]
            e['phases'][phase-1]=url; e.setdefault('blockedPhases',{}).pop(str(phase),None)
        elif e['phases'][phase-1]==url:
            e['phases'][phase-1]=None; e.setdefault('blockedPhases',{})[str(phase)]=notes
        for row in e.get('importedCandidates',[]):
            if row['url']==url: row['reviewStatus']=status
        write(MANIFEST,m)
    finally: os.close(fd); lock.unlink()

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--exercise',required=True);p.add_argument('--phase',type=int,required=True);p.add_argument('--url',required=True);p.add_argument('--status',choices=['approved','rejected'],required=True);p.add_argument('--reviewer',required=True);p.add_argument('--notes',required=True);a=p.parse_args();review(a.exercise,a.phase,a.url,a.status,a.reviewer,a.notes)
