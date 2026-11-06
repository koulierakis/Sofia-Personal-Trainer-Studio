# OmniBulk integration — Phase 1 security boundary

Status: IN PROGRESS. This document does not claim a working integration.

## Architecture
OmniBulk runs as a separate, authenticated media-processing service. This application remains the owner of its existing UI, exercise/frame records, and local data. No production endpoint, API key, or GPU billing is enabled by this change.

## Required gateway contract (not yet implemented)
- GET /v1/health: {status, version, capabilities}, with no secrets.
- POST /v1/jobs: authenticated, idempotency-key protected, validated input, returns job ID; no fabricated success.
- GET /v1/jobs/:id: queued/running/succeeded/failed/external_blocked, output only after verification.
- POST /v1/assets: validated upload with ownership and reference digest.
- GET /v1/assets/:id: access controlled.
- GET /v1/jobs/:id/artifacts: authenticated, verified files and manifest.

## Security gates
Do not call the uploaded OmniBulk server endpoints directly from the browser: its current /api/assets and /api/jobs mutations lack verified authentication. A trusted backend gateway must enforce authentication, authorization, size limits, CORS allowlist, rate limits and server-side secrets. External endpoints and billable GPU remain disabled until explicit approval.

## Integration scope
SOFIA: preserve FramePlayer, MotionValidation, sameImageAs, reference image digests and human review. Never replace anatomical validation with a successful generation status.
GIANNIS: preserve PhotoStudio, VideoStudio and VaultGallery. Only add an optional provider through a gateway and retain current providers as fallback.

## Acceptance
Real build/tests, verified sample image, verified MP4/GIF, failure-path tests, no mock success, and no changes to main until review.
