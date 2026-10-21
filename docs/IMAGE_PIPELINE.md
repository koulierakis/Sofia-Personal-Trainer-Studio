# Exercise image production and review

The audited base is 54db1e1, not the historical da8a2d9. There are 100 Functional records, 208 unapproved original concepts, 10 programs and 80 program references. Browser-only imports/approvals are not available to this repository audit. No ZIPs were found in the workspace or named in reachable Git history. Existing 146 WebPs are preserved. The new functional-031 phase-1 image is a candidate, not a certified demonstration.

## Reproduce

Use the existing checkout in the isolated task; do not create a worktree.

```sh
cd /workspace/Sofia-Personal-Trainer-Studio
python -m venv .venv-images
.venv-images/bin/pip install -r tools/image-library/requirements.txt
. .venv-images/bin/activate
npm test
npm run images:test
npm run images:validate
npm start
```

The app is static on Vercel (`public`); no frontend build or npm dependency installation is necessary. The Node development server adds `/api/health`; that endpoint is not part of the static Vercel output. Validate the homepage, manifest, JS and actual WebP responses as well as health locally.

`images:validate` checks technical file/mapping integrity; a pass does **not** mean the image library is complete. `docs/image-audit.json` inventories all exercise statuses, binary dimensions/hashes, phases and missing imagery. `docs/production-queue.json` contains one action per unapproved phase. Phase counts retain existing image sequences when they exceed draft storyboards; coach review of the movement specifications remains required, especially for Advanced concepts. Exact hashes find binary duplicates, not all visually similar or mislabeled poses. All imagery still needs human biomechanical review.

## KinesioForge or other local export

A ZIP or directory is an input container, never an identity mapping. Supply an external JSON mapping:

```json
{
  "version": 1,
  "images": [{
    "file": "farmer-start.png",
    "sha256": "FULL_SHA256_OF_INPUT_FILE",
    "sofiaExerciseId": "functional-031",
    "sofiaPhase": 1,
    "sourceExerciseId": "KINESIOFORGE_ACTUAL_ID",
    "sourcePhase": "start",
    "provider": "KinesioForge",
    "mappingReview": "approved",
    "mappingReviewer": "PERSON_WHO_CHECKED_EXACT_EXERCISE_AND_PHASE"
  }]
}
```

```sh
npm run images:import -- --source /path/to/export.zip --mapping /path/to/mapping.json --dry-run
npm run images:import -- --source /path/to/export.zip --mapping /path/to/mapping.json
npm run images:validate
```

Inputs: single-frame PNG/JPEG/WebP, 256–8192 pixels per side, at most 24 million pixels and 8 MiB. Whole-batch prevalidation rejects unsafe paths, symlink escapes, bad signatures/decoding, invalid IDs/phases, unreviewed mappings, wrong hashes, duplicate targets and duplicate input/output hashes. Assets use phase plus content hash, never overwrite old imagery, and are converted to RGB WebP quality 88. The manifest is replaced atomically after staging files, with an exclusive import/review lock and rollback on ordinary exceptions. A process crash can leave an orphan asset or lock; inspect those before recovery. No training program is changed or KinesioForge exercise added.

New imagery appears in the exercise's candidate review gallery. It does not replace existing approved work or become a movement phase until reviewed. Coach approval is a separate persisted decision:

```sh
npm run images:review -- --exercise functional-031 --phase 1 --url /images/exercises/functional-031/01-CONTENTHASH.webp --status approved --reviewer 'Actual coach name' --notes 'Actual anatomy, stance, grip, equipment and phase assessment'
npm run images:audit
```

Do not execute that command using an invented coach identity. Decisions bind to the exact image SHA256. Browser-local decisions remain local and are not automatically copied into this manifest. The new command refuses replacing a different hash already approved through the persistent review path. Rejected generations remain preserved as candidates.

## Optional ComfyUI local runner

No real ComfyUI server was reachable at this cloud machine's `127.0.0.1:8188`. That address is not the user's Windows machine. Copy `tools/image-library`, `docs/production-queue.json` and an actual ComfyUI **API-format** workflow to the machine running ComfyUI, install the pinned Pillow dependency, and run there:

```sh
python tools/image-library/comfy.py --endpoint http://127.0.0.1:8188 --workflow /path/to/api-workflow.json --queue docs/production-queue.json --output .image-production --limit 4
```

Place the complete string `SOFIA_PROMPT` in the workflow's intended text input. Supply the model/checkpoint and graph supported by that installation; no unverified model or fabricated workflow is bundled. The runner uses `/system_stats`, `/object_info`, `/prompt`, `/history/{prompt_id}` and `/view`. It validates node classes, requires SaveImage, preserves metadata, polls progress, saves prompt IDs, downloads and checks one image per phase, and writes a ZIP/mapping for intake. Use `--retry-failed` only after fixing a failed execution. Interrupted jobs resume by prompt ID; an ambiguous POST is recorded as `submitting` and must be reconciled with server history before retrying. Completed jobs are not resubmitted. Keep queue, workflow and state together when resuming; use the same batch limit.

Loopback endpoints only are accepted. Do not expose unauthenticated ComfyUI to the public internet. For remote work, run locally and transfer the ZIP. Inspect and explicitly approve source mappings before `images:import`; generation is never automatic human approval. The runner was verified against a real HTTP test fixture, not a model-backed ComfyUI installation. Automatic remote model production remains unverified.

## QA and delivery limitations

The 021–030 sequences and Bear Crawl alternatives were screened as labeled contact sheets. Cropped overhead equipment/hands and unclear crawl progression remain visible. All historical 14 blocked phases and 6 additional crawl candidates stay out of valid coverage. Renegade Row repeats the same side; Man Maker lacks a second-side row; these sequence issues remain in review notes. No individual full-resolution biomechanical certification or Sofia approval was performed. Original candidate bytes and mappings were retained.

A new 031/1 image was actually generated with OpenAI's available image generation tool, viewed and imported through the production intake code. It shows full-body standing loaded carry setup with both dumbbells visible. Its stance/load symmetry and suitability for the specific sequence still require coach review. Image generation is available; the rest of the queue has **not** been generated and must not be reported as generation-infrastructure blocked.

Production URL and GitHub API requests currently fail with proxy 403. Required domains were saved in the environment draft: api.github.com, api.vercel.com, sofia-personal-trainer-studio.vercel.app. This does not apply network policy or publish the cloud environment. No production deployment or production asset validation is established by local tests. Review/save environment settings and publish the cloud environment to apply the draft, then retry external verification. Do not supply tokens in chat.
