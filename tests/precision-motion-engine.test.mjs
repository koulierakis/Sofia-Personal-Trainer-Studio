import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeExercise } from '../src/services/precision-motion-engine.mjs';

test('squat yields one ordered cycle and reuses its initial image at closure', () => {
  const plan = analyzeExercise({ id: 'pilot-squat', name: 'Bodyweight Squat', equipment: ['Bodyweight'] }, { identityLock: 'APPROVED REFERENCE LOCK' });
  assert.equal(plan.status, 'PROMPTS_READY');
  assert.deepEqual(plan.frames.map((f) => f.label), ['Αρχική θέση', 'Κάτω θέση καθίσματος', 'Επιστροφή στην αρχική θέση']);
  assert.equal(plan.frames.at(-1).sameImageAs, 1);
  assert.match(plan.frames[0].prompt, /APPROVED REFERENCE LOCK/);
  assert.match(plan.frames[1].prompt, /Αριστερά\/δεξιά/);
  assert.ok(plan.frames[0].poseSpec && plan.frames[1].poseSpec);
  assert.equal(plan.validation.visualContinuity, 'NOT_VERIFIED');
  assert.equal(plan.validation.coachApproval, 'REQUIRED');
});

test('unique prompts include support, equipment, constraints and angle targets', () => {
  const plan = analyzeExercise({ name: 'Glute Bridge', equipment: ['Mat'] });
  for (const f of plan.frames.filter((frame) => !frame.sameImageAs)) {
    assert.match(f.prompt, /Σημεία στήριξης/);
    assert.match(f.prompt, /Εξοπλισμός/);
    assert.match(f.prompt, /Αρνητικοί περιορισμοί/);
    assert.ok(f.angles.length > 0);
  }
});

test('unsupported exercise fails closed without fabricated poses', () => {
  const plan = analyzeExercise({ name: 'Uncatalogued flowing drill', instructions: 'Move naturally.' });
  assert.equal(plan.status, 'UNCERTAIN');
  assert.equal(plan.frames.length, 0);
  assert.equal(plan.validation.anatomy, 'NOT_ASSESSED');
  assert.ok(plan.issues.length > 0);
});

test('isometric plank is marked incomplete without additional repetition details', () => {
  const plan = analyzeExercise({ name: 'Plank' }, { mode: 'video' });
  assert.equal(plan.mode, 'video');
  assert.equal(plan.status, 'UNCERTAIN');
  assert.match(plan.issues.join(' '), /ισομετρική θέση/i);
  assert.match(plan.videoPrompt, /Κλείσε την επανάληψη/i);
});
