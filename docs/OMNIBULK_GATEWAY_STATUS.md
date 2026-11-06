# OmniBulk gateway status — Sofia

Status: BLOCKED for job submission; this document does not claim an application integration.

The existing `src/services/omnibulkClient.ts` and `docs/OMNIBULK_INTEGRATION_PLAN.md` were reviewed and retained. The client performs a safe read-only HTTPS health probe. It has no authenticated asset upload, job submission, polling, retry/cancel, or artifact retrieval.

The attached OmniBulk source was inspected and corrected locally. It remains loopback-only by default and its external API requires a bearer token, but it does not yet provide a trusted multi-user gateway/session boundary. Putting that token in this browser application would expose the service credential. Therefore this branch does not submit work to that endpoint.

Before enabling Sofia requests, the shared engine must provide an authenticated gateway with per-application authorization, asset ownership, durable job IDs/queue, verified artifacts, rate limits, and a server-side credential path. Then connect the existing exercise UI while preserving FramePlayer, MotionValidation, sameImageAs, references, approved records, and human approval. A real squat pilot still requires generated image files and human review; angle calculations and a renderer test do not qualify.

No ComfyUI worker, AI API credential, or production endpoint was enabled. No production deployment was modified.