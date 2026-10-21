import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {imageFor,setImageReview,readImageReviews} from '../public/exercise-image-library.js';
const manifest=JSON.parse(await readFile(new URL('../public/data/exercise-images.json',import.meta.url)));
test('Every published phase and review candidate exists as WebP; blocked phases cannot render',async()=>{
 const listed=new Set();
 for(const [id,e] of Object.entries(manifest.exercises)){
  assert.equal(e.status,'pending_visual_review');
  for(const url of [...(e.candidates||[]),...(e.importedCandidates||[]).map(c=>c.url),...(e.additionalReviewCandidates||[])]){const b=await readFile(new URL('../public'+url,import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');listed.add(url);}
  for(const [i,url] of e.phases.entries()){
   if(!url||e.blockedPhases[String(i+1)]){assert.equal(url,null);assert.equal(imageFor({},id,i,manifest.exercises,{}),null);}
   else assert.equal(imageFor({},id,i,manifest.exercises,{}).url,url);
  }
 }
 const files=await readdir(new URL('../public/images/exercises/',import.meta.url),{recursive:true});
 const onDisk=files.filter(p=>p.endsWith('.webp')).map(p=>'/images/exercises/'+p.replaceAll('\\','/'));
 assert.deepEqual([...listed].sort(),onDisk.sort(),'Every production WebP must be tracked by the manifest');
});
test('Coach decisions persist per exact ID, phase and asset; no automatic approvals',()=>{
 const memory=new Map();const storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 const id='functional-022',url=manifest.exercises[id].phases[0];
 assert.equal(imageFor({},id,0,manifest.exercises,{}).status,'pending_visual_review');
 setImageReview(id,0,url,'approved',storage);
 assert.equal(imageFor({},id,0,manifest.exercises,readImageReviews(storage)).status,'approved');
 setImageReview(id,0,url,'rejected',storage);
 assert.equal(imageFor({},id,0,manifest.exercises,readImageReviews(storage)).status,'rejected');
 assert.equal(imageFor({},id,1,manifest.exercises,readImageReviews(storage)).status,'pending_visual_review');
 assert.throws(()=>setImageReview(id,0,url,'invalid',storage));
});
test('New generation attempts exist but are not promoted to exercise phases',async()=>{
 const e=manifest.exercises['functional-027'];assert.equal(e.additionalReviewCandidates.length,6);assert.ok(e.phases.every(p=>p===null));
 for(const url of e.additionalReviewCandidates){const b=await readFile(new URL('../public'+url,import.meta.url));assert.equal(b.toString('ascii',8,12),'WEBP');}
});
test('All ten programs resolve their explicit exercise references to the central catalog',async()=>{
 const catalog=[];for(let n=1;n<=4;n++)catalog.push(...JSON.parse(await readFile(new URL('../public/data/functional-0'+n+'.json',import.meta.url))));
 const programs=JSON.parse(await readFile(new URL('../public/data/functional-programs.json',import.meta.url)));assert.equal(programs.length,10);let references=0;
 for(const program of programs)for(const block of program.blocks){const id=block.activity.match(/\bfunctional-\d{3}\b/)?.[0];if(id){assert.ok(catalog.some(e=>e.id===id));references++;}}
 assert.equal(references,80);
});
test('Unapproved imported candidates stay outside movement phases and keep exact provenance',()=>{
 let imported=0;
 for(const [id,e] of Object.entries(manifest.exercises))for(const c of e.importedCandidates||[]){
  imported++;
  assert.equal(c.sourceExerciseId,id);
  assert.ok(Number.isInteger(c.phase)&&c.phase>=1&&c.phase<=e.phases.length);
  assert.match(c.sha256,/^[a-f0-9]{64}$/);
  assert.match(c.sourceSha256,/^[a-f0-9]{64}$/);
  if(c.reviewStatus!=='approved')assert.ok(!e.phases.includes(c.url),'Unapproved imports cannot become movement phases');
 }
 assert.ok(imported>0);
});
test('Blocked URLs cannot render even if a malformed manifest maps them',()=>{
 const url='/images/exercises/functional-021/05.webp';
 assert.equal(imageFor({},'functional-021',0,{'functional-021':{status:'approved',phases:[url],blockedPhases:{1:'rejected'}}},{}),null);
});
test('Resumed queue links every unapproved imported phase to its candidate URLs',async()=>{
 const queue=JSON.parse(await readFile(new URL('../docs/production-queue.json',import.meta.url))).jobs;
 for(const [id,e] of Object.entries(manifest.exercises))for(const c of e.importedCandidates||[]){
  if(c.reviewStatus==='rejected'||e.phaseReviews?.[String(c.phase)]?.status==='approved')continue;
  const job=queue.find(j=>j.exerciseId===id&&j.phase===c.phase);
  assert.ok(job,'Unreviewed phase must remain in queue');
  assert.equal(job.action,'human_review','Existing candidate must not be regenerated');
  assert.ok(job.candidateUrls.includes(c.url),'Reviewer needs the exact candidate URL');
 }
});
test('Production checkpoint preserves original assets and excludes rejected attempts from coverage',async()=>{
 const {createHash}=await import('node:crypto');
 const checkpoint=JSON.parse(await readFile(new URL('../docs/image-production/batch-2026-10-21-031-032.json',import.meta.url)));
 assert.equal(checkpoint.attempts.length,8);
 for(const [url,hash] of Object.entries(checkpoint.baselineAssetHashes)){
  const b=await readFile(new URL('../public'+url,import.meta.url));
  assert.equal(createHash('sha256').update(b).digest('hex'),hash,'Original asset bytes must be preserved');
 }
 for(const a of checkpoint.attempts){
  assert.equal(a.humanApproval,false);
  if(a.decision==='rejected'){
   const evidence=await readFile(new URL('../'+a.rejectedEvidence,import.meta.url));
   assert.equal(createHash('sha256').update(evidence).digest('hex'),a.rejectedEvidenceSha256);
   assert.ok(!Object.values(manifest.exercises).some(e=>(e.importedCandidates||[]).some(c=>c.sourceSha256===a.sourceSha256)),'Rejected attempt cannot count as imported coverage');
  }else{
   const e=manifest.exercises[a.exerciseId],c=e.importedCandidates.find(c=>c.sourceSha256===a.sourceSha256);
   assert.equal(c.phase,a.phase);assert.equal(c.sha256,a.importedSha256);assert.equal(c.url,a.importedUrl);
  }
 }
});
