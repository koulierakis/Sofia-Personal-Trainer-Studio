import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareReferenceGeneration} from '../src/services/reference-generation.mjs';
const ref={profile:'male',sha256:'a'.repeat(64),bytes:new Uint8Array([1,2]),mimeType:'image/jpeg'};
const base={exerciseId:'exercise-1',frameId:1,prompt:'Feet hip width, knees extended',profile:'male',reference:ref};
test('rejects text-only providers',()=>assert.throws(()=>prepareReferenceGeneration({...base,provider:{supportsReferenceImage:false}}),/cannot attach/));
test('rejects mismatched model',()=>assert.throws(()=>prepareReferenceGeneration({...base,profile:'female',provider:{supportsReferenceImage:true,attachReference:()=>({})}}),/mismatch/));
test('rejects missing image bytes',()=>assert.throws(()=>prepareReferenceGeneration({...base,reference:{...ref,bytes:null},provider:{supportsReferenceImage:true,attachReference:()=>({})}}),/bytes/));
test('does not claim identity verification on attachment',()=>{
  const result=prepareReferenceGeneration({...base,provider:{supportsReferenceImage:true,attachReference:(bytes,mime)=>({bytes,mime})}});
  assert.equal(result.identityVerified,false);
  assert.equal(result.reviewStatus,'UNCERTAIN');
  assert.equal(result.attachment.bytes.byteLength,2);
});
