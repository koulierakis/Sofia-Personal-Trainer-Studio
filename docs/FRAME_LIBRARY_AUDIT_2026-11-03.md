# Sofia frame inventory audit — 2026-11-03

Source: the user-provided Sofia Personal Trainer Studio ZIP, inspected locally. This is a **static data audit**, not a visual or biomechanics certification; repository content may change after the snapshot.

## Coverage
- 100 functional exercises + 12 custom sequences = **112 exercise records** with unique IDs.
- **606 declared frame records**: **494 unique frame positions** and **112 closing frames** using `sameImageAs`.
- Model assignments: **56 male / 56 female**.
- **97 exercises** have >4 frame records; these are *candidates for minimization review*, not proven errors.
- **12 custom sequences** have `requiresCoachReview: true` and `source: original-ai-designed-unverified`.
- **112/112** exercise visualization records have no generated image attached in their frame objects. This does not prove no image assets exist elsewhere.
- No empty pose descriptions, empty transition descriptions, missing reference paths/digests/templates, invalid closing reuse links, or adjacent duplicate pose descriptions were detected by these structural checks.

## Important distinctions
- The per-frame `poseDescription` and `transitionDescription` fields are present, but anatomical completeness, joint angles, movement continuity and safety have **not** been verified frame by frame.
- A `referenceSha256` string and reference path are metadata; neither proves that the provider received the image bytes or that generated identity matches.
- Frame minimization requires expert comparison of the actual phases and source movement, not just a count threshold.
- Do not mark any exercise visually approved until actual generated images are inspected and review evidence is persisted.

## Next acceptance gates
1. Validate exact frame-specific anatomy and transitions for every exercise, prioritizing the 12 custom sequences and high-risk compound movements.
2. Record issues per exercise/frame, with corrected pose prompts and justification for frame count.
3. Verify reference file bytes/digest, attach reference to a compatible image generator, and capture evidence of the actual generation request.
4. Inspect real generated images using pose estimation and human review.
5. Persist approvals with content hashes and invalidate approvals on edits.
6. Run automated tests, build, and a real Zevara pilot. No claim of completion before these pass.

The per-exercise CSV audit was generated as a downloadable conversation artifact; it is not yet committed to the repository.


## Prompt-level inspection — follow-up
A rule-based scan of the 112 source exercise records found:
- **133 unique frame pose descriptions** starting with imperative verbs (e.g., "Μετακίνησε", "Χαμήλωσε", "Πίεσε"). Such instructions describe motion rather than a frozen body configuration; review individually, not automatic failures.
- **86 frame pose descriptions** containing explicit 45° or 90° angles. Check for unjustified universal angles; these can be correct in some movements (e.g., dead bug).
- **494 non-reused frame records** with no `imageUrl` attached to their frame objects.

Example: Bodyweight Squat frame 2 says "Μετακίνησε ισχία ελαφρά πίσω και λύγισε σταδιακά γόνατα". A static image prompt should instead state the *resulting* knee/hip flexion, foot contact, trunk orientation and arm position, without inventing exact joint angles. This example is flagged for coach review, not auto-rewritten.

Run `node scripts/audit-frame-poses.mjs` to regenerate detailed per-frame issues locally. The audit is structural and heuristic; it does not certify pose safety.
