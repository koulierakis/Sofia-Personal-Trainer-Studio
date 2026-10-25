import test from 'node:test';
import assert from 'node:assert/strict';
import {playerImageEntry,imageFor} from '../public/exercise-image-library.js';

function fixture(){
 const id='functional-001';
 const urls=Array.from({length:6},(_,i)=>`/images/exercises/${id}/0${i+1}-0123456789abcdef.webp`);
 return {status:'pending_visual_review',phases:['/legacy.webp'],phaseReviews:{},blockedPhases:{1:'legacy reject'},
  importedCandidates:urls.map((url,i)=>({url,phase:i+1,reviewStatus:'pending_visual_review'})),
  storyboardPreview:{status:'pending_visual_review',coachApproved:false,phases:urls,labels:['a','b','c','d','e','f']}};
}
test('Player previews all six exact pending candidate URLs while preserving legacy mappings',()=>{
 const original=fixture(),snapshot=structuredClone(original),entry=playerImageEntry(original);
 assert.equal(entry.previewActive,true);
 assert.equal(entry.phases.length,6);
 for(let i=0;i<6;i++)assert.equal(imageFor({},'functional-001',i,{'functional-001':entry},{}).url,original.storyboardPreview.phases[i]);
 assert.deepEqual(original,snapshot);
});
test('Approved sequences and rejected preview candidates cannot be superseded',()=>{
 const approved=fixture();approved.phaseReviews[1]={status:'approved'};
 assert.equal(playerImageEntry(approved),approved);
 const rejected=fixture();rejected.importedCandidates[2].reviewStatus='rejected';
 assert.equal(playerImageEntry(rejected),rejected);
 const incomplete=fixture();incomplete.storyboardPreview.phases.pop();
 assert.equal(playerImageEntry(incomplete),incomplete);
});
test('Complex exercises expose ten movement stages rather than a fixed six',()=>{
 const entry=fixture();
 const urls=Array.from({length:10},(_,i)=>`/images/exercises/functional-001/${String(i+1).padStart(2,'0')}-0123456789abcdef.webp`);
 entry.storyboardPreview.phases=urls;
 entry.storyboardPreview.labels=urls.map((_,i)=>'Movement stage '+(i+1));
 entry.importedCandidates=urls.map((url,i)=>({url,phase:i+1,reviewStatus:'pending_visual_review'}));
 assert.equal(playerImageEntry(entry).phases.length,10);
 assert.equal(imageFor({},'functional-001',9,{'functional-001':playerImageEntry(entry)},{}).url,urls[9]);
});
