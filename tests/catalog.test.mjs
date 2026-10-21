import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOriginalConcepts} from '../public/advanced-catalog.js';
import {exerciseStoryboard} from '../public/storyboard-prompts.js';
test('208 original entries, unique IDs, four phases and Greek instructions',()=>{
 const xs=buildOriginalConcepts();
 assert.equal(xs.length,208);
 assert.equal(new Set(xs.map(x=>x.id)).size,208);
 for(const x of xs){
  assert.equal(x.level,'Advanced');
  assert.equal(x.discipline,'functional');
  assert.equal(x.requiresCoachReview,true);
  assert.equal(x.verified,false);
  assert.equal(x.reviewStatus,'pending');
  assert.equal(x.phases.length,4);
  assert.ok(x.instructions.length>250);
  assert.ok(x.phases.every(p=>typeof p.cue==='string'&&p.cue.length>40));
  assert.ok(x.phases.every(p=>!p.image),'No fabricated visuals');
 }
});
test('Sofia homepage and JS exist and use the expected catalog',async()=>{
 const fs=await import('node:fs/promises');
 const html=await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
 const app=await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(html,/data-mode="functional"/);
 assert.match(html,/data-mode="pilates"/);
 assert.match(html,/id="concepts"/);
 assert.match(app,/buildOriginalConcepts/);
 assert.match(app,/requiresCoachReview/);
 assert.match(app,/SpeechRecognition/);
 assert.match(app,/data\.exercises/);
 assert.match(app,/data\.programs/);
});

test('Image prompt storyboard: simple 4, Advanced 6, model and studio repeated',()=>{
 const basic=exerciseStoryboard({id:'functional-001',name:'Bodyweight Squat',level:'Beginner',equipment:['Βάρος σώματος'],instructions:'Σωστή εκτέλεση squat.'});
 const advanced=exerciseStoryboard(buildOriginalConcepts()[0]);
 assert.equal(basic.length,4);
 assert.equal(advanced.length,6);
 for(const story of [basic,advanced])for(const frame of story){
   assert.match(frame.prompt,/Greek\/Mediterranean/);
   assert.match(frame.prompt,/black/);
   assert.match(frame.prompt,/modern personal training studio/);
   assert.equal(frame.status,'prompt_only');
 }
});
