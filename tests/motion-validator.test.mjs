import test from 'node:test';
import assert from 'node:assert/strict';
import {angle,evaluate,correctionPrompt} from '../src/services/motion-validator.mjs';
const pt=(x,y)=>({x,y,visibility:0.99});
const pose=(bent=false)=>({
 left_shoulder:pt(.4,.2),right_shoulder:pt(.6,.2),
 left_hip:pt(.4,.4),right_hip:pt(.6,.4),
 left_knee:pt(bent?.55:.4,.6),right_knee:pt(.6,.6),
 left_ankle:pt(.4,.8),right_ankle:pt(.6,.8)
});
test('angle rejects missing joints',()=>assert.equal(angle(null,pt(0,0),pt(1,1)),null));
test('empty landmarks fail closed',()=>assert.equal(evaluate('πίσω προβολή',[]).status,'UNCERTAIN'));
test('extended knees fail bent knee requirement',()=>assert.equal(evaluate('πίσω προβολή',pose()).status,'FAILED'));
test('unrecognized semantics never auto approve',()=>{const r=evaluate('σηκώστε τα χέρια',pose());assert.equal(r.status,'UNCERTAIN');assert.equal(r.automaticallyApproved,false)});
test('no prior-frame motion causes transition failure',()=>assert.equal(evaluate('πίσω προβολή',pose(true),pose(true),{expectChange:true}).status,'FAILED'));
test('corrective prompt contains failure',()=>assert.match(correctionPrompt('πίσω προβολή',evaluate('πίσω προβολή',pose())),/Διόρθωσε/));
