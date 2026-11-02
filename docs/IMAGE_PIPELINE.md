# Exercise image production and review

## Canonical exercise visualization sequence

Every exercise record now carries a `visualization` object. It contains the complete exercise-specific frame sequence, the fixed approved Sofia model/background reference and its SHA-256, and one independent prompt for each pose. The chosen sequence has 3–20 frames, including the initial pose as Frame 1 and a closing frame whose `sameImageAs: 1` value requires reuse of Frame 1's exact image. The closing image is not generated a second time.

The same sequence schema is used by the 100 Functional records, 12 Hybrid records and 208 custom concepts. The 208 custom concepts remain proposed Advanced/Full Body entries requiring coach review. Built-in exercise details, imported exercise data, the prompt export and the workout player all read this canonical sequence; older `imagePrompts` or phase arrays are not allowed to change its frame order. An older image sequence is shown only when its frame count matches the canonical sequence.

AI prompts are available per frame in the exercise detail and downloadable together. Each prompt names the exact approved model/background image and its SHA-256, specifies one body pose and the transition context, and instructs the image tool not to invent a model or setting. No existing exercise-movement photograph is required as input. A generated image remains a candidate until the coach reviews it.

For image production, use the one-image-per-frame jobs in `docs/production-queue.json` and honor `reuseImageFromPhase`/`sameImageAs` without submitting a generation request for the closing frame. The older composite storyboard helper in `bulk_storyboards.py` can make multi-panel drafts; those drafts cannot satisfy exact closing-frame reuse and must not be used as the canonical frame sequence without reconciliation.

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

Delivery update: implementation commit `06cd845` was pushed successfully to `main` and independently confirmed with `git ls-remote`. Network access to the production URL and GitHub commit/check APIs subsequently succeeded. Production still has the old 30-entry manifest, without functional-031. GitHub Actions run 39592973458 did not start: its annotation says recent account payments failed or the spending limit needs increasing. This is an account blocker, not an executed test failure. Local checks passed: 11 Node tests, 9 Python tests, syntax checks and 147/147 HTTP WebP requests.

The Vercel commit status is failure, description `Deployment was blocked`, linking to https://vercel.com/koulierakisg-8150/sofia-personal-trainer-studio/CKgBCbx2r9gAndzJ25ki6qiHi7Tv . The exact block reason is not available from the public commit status. The Vercel API responds `missingToken:true`; VERCEL_TOKEN is absent and no existing Vercel binding was configured. No claim is made that this missing API token caused the Git-triggered deployment block. Authenticated inspection is needed. A VERCEL_TOKEN requirement scoped to api.vercel.com was saved to environment settings; enter it securely there, never in chat. Alternatively inspect the blocked deployment directly in the Vercel dashboard. GitHub billing/spending needs resolution before hosted CI can run.

Saved cloud configuration includes tested install/start instructions, the Vercel secret requirement and domain additions api.github.com, api.vercel.com, vercel.com and sofia-personal-trainer-studio.vercel.app. Draft saving does not publish the cloud environment; review/save it in environment settings and publish. No production delivery of this commit is confirmed. There remain 1,639 generation tasks and 127 human-review tasks. Production completion, full individual image QA and model-backed ComfyUI validation are outstanding.

## Resume after batch 2026-10-21-031-032

Read `docs/image-production/batch-2026-10-21-031-032.json` first: it checkpoints all eight actual generation attempts, source hashes, exact imported phase URLs, preliminary visual findings, two rejected opposite-step attempts and hashes for all 147 pre-existing production assets. Six new candidates are visible in the existing review gallery, not certified movement phases. Rejected evidence is retained under `docs/image-production/rejected/`, outside production coverage. Original provider PNG files remain in the workspace `generated_images` directory; the production WebPs and rejection evidence are tracked for restoration independent of that directory.

Run `npm run images:audit` before selecting more work. Queue human-review jobs now include exact `candidateUrls`; phases with retained candidates must not be generated again just because their motion-phase URL is still null. The batch intake JSON is provenance for the completed import, not a request to import it again. Duplicate imports remain rejected. Counts at this checkpoint: 153 production WebPs, 1,633 generation tasks, 133 human-review tasks, zero newly coach-approved photos. All 308 records and ten programs remain intact.

The 031 phase-3 opposite step still needs production: both attempts reproduced the same leading-leg pattern and were excluded. A next attempt should use an unambiguous opposite-leg reference or an actual validated KinesioForge/ComfyUI export. No genuine KinesioForge export was available in this workspace or reachable Git history during this batch. Do not synthesize programmatic graphics as photographs. The 032 sequence needs coach assessment of support-leg/pressing-hand assignment, rigid landmine geometry and shoulder mechanics before promotion. No blocker prevents further general image generation; this is a completed, review-pending batch checkpoint, not full-library completion.

