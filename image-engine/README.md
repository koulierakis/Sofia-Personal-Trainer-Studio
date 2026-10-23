# Sofia AI Image Engine bridge (integration branch)

This is an **opt-in server-side bridge**, not a verified working image generator. The existing Sofia application remains the source of truth for exercise records.

## Safety
- Disabled unless `SOFIA_IMAGE_ENGINE_URL` is configured.
- Only a loopback service is accepted; no arbitrary URLs, paid providers, or browser-exposed API keys.
- Status endpoint does not claim successful inference.
- No generated image is automatically accepted into the exercise library.

## API
- `GET /api/image-engine/status`: bridge configuration state.
- `POST /api/image-engine/generate`: forwards `{ "prompt": "...", "seed": 123 }` to a local worker at `/api/generate`.
- The upstream worker must implement that contract; the Google AI Studio generator may use a **different** endpoint. Verify its actual route before enabling.

## Next gates
1. Verify the generator's real route and response schema.
2. Run Node tests and real upstream generation; save the image and validate dimensions and format.
3. Add persistent, reviewed exercise-image imports with backup and rollback.
4. Confirm deployed Sofia runtime can reach the worker. A cloud server cannot reach a user's `127.0.0.1`.

No production deployment or main-branch merge is authorized by this module.
