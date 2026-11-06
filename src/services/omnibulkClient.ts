/**
 * OmniBulk read-only connectivity probe.
 * No browser-to-engine mutation is permitted until an authenticated gateway exists.
 */
export type OmniBulkHealth = {
  status: string;
  version?: string;
  capabilities?: Record<string, unknown>;
};

export async function probeOmniBulk(
  gatewayBaseUrl: string,
  timeoutMs = 5000,
): Promise<{ connected: boolean; health?: OmniBulkHealth; reason?: string }> {
  if (!gatewayBaseUrl) return { connected: false, reason: 'NOT_CONFIGURED' };
  let url: URL;
  try {
    url = new URL(gatewayBaseUrl);
  } catch {
    return { connected: false, reason: 'INVALID_URL' };
  }
  if (url.username || url.password || url.search || url.hash) {
    return { connected: false, reason: 'UNSAFE_URL' };
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    return { connected: false, reason: 'HTTPS_REQUIRED' };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(new URL('/v1/health', url), {
      method: 'GET',
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
    });
    if (!response.ok) return { connected: false, reason: 'HTTP_' + response.status };
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object' || typeof (payload as {status?:unknown}).status !== 'string') {
      return { connected: false, reason: 'INVALID_RESPONSE' };
    }
    const health = payload as OmniBulkHealth;
    return health.status === 'ready'
      ? { connected: true, health }
      : { connected: false, health, reason: 'ENGINE_NOT_READY' };
  } catch {
    return { connected: false, reason: 'NETWORK_OR_TIMEOUT' };
  } finally {
    clearTimeout(timeout);
  }
}
