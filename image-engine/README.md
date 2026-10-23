# Sofia AI Image Engine — local verification

The bridge is disabled unless SOFIA_IMAGE_ENGINE_URL is set in the **Sofia server process**. Only loopback generator URLs are accepted.

## Windows PowerShell (two terminals)

Prerequisite: Node.js 20+ and a working local copy of GIANNIS AI IMAGE GENERATOR. The generator project starts on port 3000 using its `npm run dev` script.

Terminal A, from the generator project:

```powershell
npm install
npm run lint
npm run build
npm run dev
```

Terminal B, from the Sofia repository:

```powershell
$env:SOFIA_IMAGE_ENGINE_URL = "http://127.0.0.1:3000"
npm test
npm start
```

Terminal C, from the Sofia repository:

```powershell
$env:SOFIA_REFERENCE_IMAGE = (Resolve-Path ".\public\generated\sofia_fitness_squat_1792787128316.jpg").Path
node .\image-engine\verify-live.mjs
```

Use an existing real PNG/JPEG/WebP image path for SOFIA_REFERENCE_IMAGE; the example filename is from the generator's sample images, and may not exist in Sofia. Copy a real image to `reference.png` in the Sofia repository and set `$env:SOFIA_REFERENCE_IMAGE = (Resolve-Path ".\reference.png").Path` if necessary.

Successful verification saves images under `live-verification/`. A nonzero exit code means a test failed.

**Important:** The generator's Pollinations, ComfyUI and Forge routes currently do not prove image-to-image conditioning; only the Gemini path forwards the reference image in the inspected code. The live script deliberately rejects an image-to-image result from an unverified provider. Successful image bytes alone do not prove image conditioning.

Sofia's package.json has **no build script**: it is a Node.js server serving static files. Use `npm test` and `node --check server.mjs` for its executable server entrypoint. Generator has `npm run build` and `npm run lint`. Neither production build nor actual provider inference is certified until run on the target machine.
