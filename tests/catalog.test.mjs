import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildOriginalConcepts } from '../src/services/advanced-catalog.ts';
import { reviewConcept, visibleConcepts, reviewCounts, sanitizeReviews } from '../src/services/review-system.ts';
import { ensureVisualization } from '../src/services/visualization-sequence.ts';

test('208 original concepts generate with unique IDs and Greek instructions', () => {
  const xs = buildOriginalConcepts();
  assert.equal(xs.length, 208);
  assert.equal(new Set(xs.map((x) => x.id)).size, 208);
  for (const x of xs) {
    assert.equal(x.level, 'Advanced');
    assert.equal(x.discipline, 'functional');
    assert.equal(x.requiresCoachReview, true);
    assert.equal(x.verified, false);
    assert.equal(x.reviewStatus, 'pending');
    assert.equal(x.phases.length, 4);
    assert.ok(x.instructions.length > 250);
    assert.ok(x.phases.every((p) => typeof p.cue === 'string' && p.cue.length > 40));
  }
});

test('React application files and HTML metadata exist and are correctly structured', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(html, /<div id="root">/);
  assert.match(html, /<title>Mpempa mou Personal AI Studio<\/title>/);
  assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
  const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.name, 'Mpempa mou Personal AI Studio');
  assert.equal(manifest.short_name, 'Mpempa mou');
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes), ['192x192', '512x512']);
  assert.match(app, /buildOriginalConcepts/);
  assert.match(app, /functional/);
  assert.match(app, /pilates/);
  assert.match(app, /SpeechRecognition/);
  assert.match(app, /reviewConcept/);
  assert.match(app, /FramePlayer/);
});

test('Review management allows approving and rejecting without resurrecting rejected exercises', () => {
  const all = buildOriginalConcepts();
  let r = {};
  r = reviewConcept(all[0].id, 'approved', r, '2026-10-21T00:00:00Z');
  r = reviewConcept(all[1].id, 'rejected', r, '2026-10-21T00:00:00Z');
  const reloaded = sanitizeReviews(JSON.parse(JSON.stringify(r)));

  const defaultList = visibleConcepts(all, reloaded, false);
  assert.equal(defaultList.length, 1);
  assert.equal(defaultList[0].approvedBySofia, true);
  assert.equal(defaultList[0].requiresCoachReview, false);

  const queue = visibleConcepts(all, reloaded, true);
  assert.equal(queue.length, 207);
  assert.ok(!queue.some((x) => x.id === all[1].id));
  assert.deepEqual(reviewCounts(all, reloaded), { pending: 206, approved: 1, rejected: 1 });
});

test('Frame visualization generates valid sequences with closing frame reuse', () => {
  const sample = buildOriginalConcepts()[0];
  const verified = ensureVisualization(sample);
  assert.ok(verified.visualization);
  assert.ok(verified.visualization.frames.length >= 4);
  const closingFrame = verified.visualization.frames[verified.visualization.frames.length - 1];
  assert.equal(closingFrame.sameImageAs, 1);
  assert.match(closingFrame.prompt, /REUSE THE EXACT IMAGE FILE/);
});

test('All built-in data files load and all 10 programs equal 60 minutes', async () => {
  const catalog = [];
  for (let n = 1; n <= 4; n++) {
    const raw = await readFile(new URL(`../public/data/functional-0${n}.json`, import.meta.url), 'utf8');
    catalog.push(...JSON.parse(raw));
  }
  assert.equal(catalog.length, 100);

  const programsRaw = await readFile(new URL('../public/data/functional-programs.json', import.meta.url), 'utf8');
  const programs = JSON.parse(programsRaw);
  assert.equal(programs.length, 10);
  for (const prog of programs) {
    const totalMinutes = prog.blocks.reduce((sum, b) => sum + Number(b.minutes || 0), 0);
    assert.equal(totalMinutes, 60);
  }
});

test('Every exercise (all 320 across catalogs) has descriptions, initial position, intermediate movements, and final reset frame', async () => {
  const f1 = JSON.parse(await readFile(new URL('../public/data/functional-01.json', import.meta.url), 'utf8'));
  const f2 = JSON.parse(await readFile(new URL('../public/data/functional-02.json', import.meta.url), 'utf8'));
  const f3 = JSON.parse(await readFile(new URL('../public/data/functional-03.json', import.meta.url), 'utf8'));
  const f4 = JSON.parse(await readFile(new URL('../public/data/functional-04.json', import.meta.url), 'utf8'));
  const custom = JSON.parse(await readFile(new URL('../public/data/custom-sequences.json', import.meta.url), 'utf8'));
  const concepts = buildOriginalConcepts();

  const allExercises = [...f1, ...f2, ...f3, ...f4, ...custom, ...concepts].map(ensureVisualization);
  assert.equal(allExercises.length, 320);

  for (const exercise of allExercises) {
    // 1. Must have instructions/description
    const desc = exercise.instructions || exercise.description;
    assert.ok(desc && desc.trim().length > 20, `Exercise ${exercise.id} must have description`);

    // 2. Must have visualization sequence
    assert.ok(exercise.visualization, `Exercise ${exercise.id} must have visualization`);
    const frames = exercise.visualization.frames;
    assert.ok(Array.isArray(frames) && frames.length >= 3 && frames.length <= 15, `Exercise ${exercise.id} must have 3 to 15 frames`);

    // 3. First frame must be initial position (Αρχική θέση)
    const firstFrame = frames[0];
    assert.equal(firstFrame.frame, 1);
    assert.ok(
      firstFrame.label.includes('Αρχική') || firstFrame.label.includes('Αρχή') || firstFrame.poseDescription.length > 10,
      `Exercise ${exercise.id} frame 1 must describe starting posture`
    );

    // 4. Intermediate frames must describe body movements and changes from previous
    for (let i = 1; i < frames.length - 1; i++) {
      const f = frames[i];
      assert.ok(f.poseDescription && f.poseDescription.trim().length > 15, `Exercise ${exercise.id} frame ${f.frame} must have pose description`);
      assert.ok(
        (f.changeFromPrevious && f.changeFromPrevious.length > 5) || (f.transitionDescription && f.transitionDescription.length > 5),
        `Exercise ${exercise.id} frame ${f.frame} must describe transition/change from previous frame`
      );
    }

    // 5. Final frame must reset / return to initial position
    const lastFrame = frames[frames.length - 1];
    assert.equal(lastFrame.frame, frames.length);
    assert.equal(lastFrame.sameImageAs, 1, `Exercise ${exercise.id} last frame must reuse initial frame image (sameImageAs: 1)`);
    assert.ok(
      lastFrame.label.includes('επαναφορά') || lastFrame.label.includes('αρχική') || lastFrame.transitionDescription?.includes('αρχική θέση'),
      `Exercise ${exercise.id} last frame must reset to initial position`
    );
  }
});

