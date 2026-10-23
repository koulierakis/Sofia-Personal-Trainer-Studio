// Optional, server-side bridge to an independently running image generator.
// No provider is simulated; no paid service is enabled here.
const MAX_BODY_BYTES = 16_384;
export function imageEngineConfig(env = process.env) {
  const raw = env.SOFIA_IMAGE_ENGINE_URL;
  if (!raw) return { configured: false };
  let url;
  try { url = new URL(raw); } catch { throw new Error('Invalid SOFIA_IMAGE_ENGINE_URL'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('Invalid image engine URL');
  }
  // The bridge is deliberately restricted to a loopback worker.
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
    throw new Error('Image engine must be a loopback service');
  }
  return { configured: true, base: url.origin };
}
export async function imageEngineHandler(req, res, env = process.env, fetcher = fetch) {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(JSON.stringify(body));
  };
  let config;
  try { config = imageEngineConfig(env); } catch (error) { send(503, { ok: false, error: error.message }); return true; }
  if (req.url?.split('?')[0] === '/api/image-engine/status') {
    if (req.method !== 'GET') { send(405, { error: 'Method not allowed' }); return true; }
    send(200, { configured: config.configured, mode: 'local-bridge', inferenceVerified: false });
    return true;
  }
  if (req.url?.split('?')[0] !== '/api/image-engine/generate') return false;
  if (req.method !== 'POST') { send(405, { error: 'Method not allowed' }); return true; }
  if (!config.configured) { send(503, { error: 'Image engine is not configured' }); return true; }
  const chunks = []; let size = 0;
  try {
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { send(413, { error: 'Request too large' }); return true; }
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (typeof body.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 4000) {
      send(400, { error: 'Valid prompt required (max 4000 characters)' }); return true;
    }
    const response = await fetcher(config.base + '/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: body.prompt.trim(), ...(typeof body.seed === 'number' && Number.isSafeInteger(body.seed) ? { seed: body.seed } : {}) }),
      signal: AbortSignal.timeout(120000),
      redirect: 'error'
    });
    if (!response.ok) { send(502, { error: 'Image engine rejected generation', upstreamStatus: response.status }); return true; }
    const result = await response.json();
    if (!result || typeof result !== 'object') { send(502, { error: 'Invalid image engine response' }); return true; }
    send(200, result);
  } catch (error) {
    send(502, { error: error instanceof SyntaxError ? 'Invalid JSON request or response' : 'Image engine unavailable' });
  }
  return true;
}
