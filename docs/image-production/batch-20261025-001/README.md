# ATHLETICO reference batch — 25 October 2026

Scope: first five of the 100 original functional exercises. The full Sofia catalog still contains 308 records. No exercise/program data changed.

Generated with the actual OpenAI conversation image tool using the two user-uploaded reference photographs now preserved under public/images/athletes/. This was not a Python API generation run: no OPENAI_API_KEY is configured. The supplied-provider script was executed on the real generated storyboard binaries, split them with Pillow and imported 20 optimized WebP candidates. A second execution skipped all five completed imports without changing files.

All five final storyboards use side or oblique side views of the referenced athlete in the ATHLETICO gym, with four descriptive movement stages per simple exercise. The format and player support 4–10 stages; complex exercises need source-based poses, rather than generic filler. The Glute Bridge source is 2171 pixels wide; a single white pixel column was appended before four exact 543-pixel cuts. No source pixels were discarded or rescaled. Source images retain their exact original bytes and checksums.

`checkpoint.json` records exact frame URLs, crop boxes, provider, references and preliminary inspection. `baseline.json` proves that all 153 pre-existing image assets are preserved. Existing phase URLs and reviews remain unchanged; `storyboardPreview` explicitly selects the new, pending-review alternative in the player. No coach approvals were assigned.

Browser verification used real headless Chromium: all five sets load, first images appear without clicking, last-frame selection works, and timed playback advances on the first exercise. The run exposed an existing initial-image loading race; the player now refreshes its current hero when the image loads.

Remaining work: coach review of identity, anatomy, lead-leg continuity, equipment and technique on all 20 new frames. The other 95 original exercises remain production work, and need exact movement storyboards plus an actual API/provider connection for an autonomous Python run. The 208 additional concepts remain separately unverified. `catalog-308-20261025/plan.json` captures their source instructions, per-exercise camera requirement and draft poses without pretending they are approved or running jobs.

Earlier generation attempts were not promoted: frontal views, incorrect column counts, uneven boundaries or cropped hands/feet failed the updated specification. Machine-generated panels are never assumed correct merely because the binary file decodes. No real 3D model was created.

Commands verified: npm test; Python unittest discovery under tools/image-library; images:validate; bulk supplied import and idempotent resume; real Chromium player checks. The repository is static JS and has no separate TypeScript or build script.
