# Sofia Motion Validator — prototype (PR #7)

## What is implemented
- A Motion Validation panel is mounted below the existing Frame Player for each selected exercise.
- Users upload a single frame image and run MediaPipe Pose in the browser. MediaPipe JS/WASM/model assets are fetched from the free jsDelivr CDN on demand; this is **not offline**.
- Landmark confidence gates, knee-angle heuristics, a limited consecutive-frame displacement check, Greek error explanations, and corrective prompt copying.
- A session-only coach approval indicator. It **does not** modify the existing coach review database or publish images.
- Unit tests in `tests/motion-validator.test.mjs`.

## Explicit limitations and acceptance gates
- This is **not** full text-to-image semantic verification. Only basic bending/extension cues are currently parsed. Unknown cues yield UNCERTAIN. No machine score proves correctness.
- 2D projected knee angles are viewpoint-dependent and must not be interpreted as clinical measurements. Thresholds are provisional and must be calibrated on approved photographs.
- Missing joints, unknown instructions, no inference, and identity/camera/clothing checks fail closed as UNCERTAIN. A coach may manually approve a session, but it is not persisted.
- Frame-to-frame checks require loading the previous frame first; landmark displacement alone cannot establish movement direction or biomechanics.
- No image generation provider or automatic regeneration loop is wired. The corrective prompt can be copied for manual generation.
- No persistent approval, image repository, privacy workflow, or full-body identity matching exists.
- A real Zevara image-based pilot has **not** been executed; no provider was invoked.
- Before merging: CI, browser image inference, manual Zevara pose QA, mobile testing, asset hosting/licensing review, and validation against known negative/positive samples are required.

## Safety policy
No automatic approval or publishing. Never equate detected landmarks with an approved exercise. Avoid paid APIs. Keep `main` unchanged until validated.
