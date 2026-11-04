# Sofia AI Coach and Precision Motion Engine

## What ships
- The selected exercise detail view mounts a Greek text and voice coach.
- With Ollama installed locally, the chat calls the configured Ollama `/api/chat` endpoint. The browser stores only the URL and model name, not an API key. Browser CORS policy must allow the app origin.
- When Ollama is unavailable, the coach uses a small deterministic Greek intent handler. This fallback is not a generative language model.
- The motion engine generates IMAGE MODE frame prompts, VIDEO MODE sequence prompts, machine-readable pose specifications and JSON export.
- The first rule templates cover squat, reverse lunge, glute/hip bridge, push-up, hip hinge/deadlift, calf raise and static plank. Unsupported or underspecified exercises return UNCERTAIN and do not receive invented frames.
- Exercise reference identity and camera lock are passed into every independently usable frame prompt from the existing approved reference-lock service.
- Closing poses reuse frame 1 when the template represents a return to the identical initial pose.
- Generated prompts do not mean images/videos were created or validated. The existing Motion Validation workflow still needs an uploaded image, and exercise approval remains a coach decision.

## Local chat setup
Install and run Ollama on the same device as the browser, pull the model entered in the coach settings, and permit the app origin under Ollama's CORS configuration. The default model label is `qwen2.5:3b`; the app does not download a model. This option has not been tested against a running Ollama server in CI.

## Validation limitations
Angle targets are instructional ranges, not individualized prescriptions. The output is rule-based, not a motion-capture analysis or clinical assessment. Side-specific assumptions are surfaced as uncertainty; a coach must confirm them before publication.
