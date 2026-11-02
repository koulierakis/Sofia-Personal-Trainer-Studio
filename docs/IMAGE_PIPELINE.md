# Exercise visualization: prompt-only library

The application contains 320 exercise records: 100 standard exercises and 220 Custom exercises (208 generated concepts plus 12 earlier multi-pattern records). All 220 Custom exercises are Advanced and appear under Full Body; each retains its exercise-specific muscle and equipment tags. The user-facing category is Custom. The older 12 records keep their internal IDs only so saved references and reviews do not break.

Each exercise has a `visualization` sequence with 3–20 ordered frames, a body-pose description, a transition description and a complete AI prompt for every frame. Frame 1 is the starting pose. The closing frame has `sameImageAs: 1`: the image tool must reuse Frame 1 byte-for-byte and must not generate a new closing image. The application detail and prompt download show the text descriptions only.

No exercise demonstration photos, storyboard sheets, candidates or rejected exercise images are stored in the repository. The exercise image manifest is empty. The only retained photos are the two approved model-and-studio references, which remain necessary for future image generation:

- `/images/athletes/athletico-female-reference.jpg`
- `/images/athletes/athletico-male-reference.jpg`

Every prompt locks the model, clothing, studio/background and SHA-256 to the selected reference. If an image tool cannot attach and honor that exact reference, it must stop. The written frame pose is the only source for movement; an old exercise photograph is not required. The final frame is a reuse instruction, not an independent generation job.

To inspect the written prompts, open any exercise and choose **Λήψη prompts όλων των καρέ**. The production queue is deliberately empty while the repository contains no exercise images. Generating and reviewing future image candidates is a separate action; generated images must not be committed automatically as approved exercise photos.
