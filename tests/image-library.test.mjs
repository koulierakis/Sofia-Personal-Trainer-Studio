import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {imageFor,setImageReview,readImageReviews} from '../public/exercise-image-library.js';
const manifest=JSON.parse(await readFile(new URL('../public/data/exercise-images.json',import.meta.url)));
test('Every published phase and review candidate exists as WebP; blocked phases cannot render',async()=>{
 let count=0;
 for(const [id,e] of Object.entries(manifest.exercises)){
  assert.equal(e.status,'pending_visual_review');
  for(const url of e.candidates){const b=await readFile(new URL('../public'+url,import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');count++;}
  for(const [i,url] of e.phases.entries()){
   if(e.blockedPhases[String(i+1)]){assert.equal(url,null);assert.equal(imageFor({},id,i,manifest.exercises,{}),null);}
   else assert.equal(imageFor({},id,i,manifest.exercises,{}).url,url);
  }
 }
 assert.equal(count,60);
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
