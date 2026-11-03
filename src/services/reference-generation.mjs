/** Provider-neutral, fail-closed preparation of a reference-image generation request.
 * A text URL in a prompt is not an attached reference image.
 */
export function prepareReferenceGeneration({ exerciseId, frameId, prompt, profile, reference, provider }) {
  if (!exerciseId || !Number.isInteger(frameId) || frameId < 1 || !String(prompt || '').trim()) {
    throw new Error('Missing exercise, frame or pose prompt');
  }
  if (!['female', 'male'].includes(profile) || reference?.profile !== profile) {
    throw new Error('Approved model mismatch');
  }
  if (!reference?.sha256 || !/^[a-f0-9]{64}$/i.test(reference.sha256)) {
    throw new Error('Missing verified reference digest');
  }
  if (!provider?.supportsReferenceImage || typeof provider.attachReference !== 'function') {
    throw new Error('Provider cannot attach a reference image; identity lock unavailable');
  }
  // The caller must supply the actual reference bytes; a path or URL is insufficient.
  if (!(reference.bytes instanceof Uint8Array) || reference.bytes.byteLength === 0) {
    throw new Error('Reference image bytes missing');
  }
  return {
    exerciseId, frameId, prompt: prompt.trim(), profile,
    referenceSha256: reference.sha256,
    attachment: provider.attachReference(reference.bytes, reference.mimeType || 'image/jpeg'),
    identityVerified: false,
    reviewStatus: 'UNCERTAIN'
  };
}
