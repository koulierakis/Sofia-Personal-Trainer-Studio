import test from 'node:test';
import assert from 'node:assert/strict';
import { imageEngineConfig, imageEngineHandler } from '../image-engine/bridge.mjs';
test('disabled by default', () => assert.deepEqual(imageEngineConfig({}), { configured: false }));
test('rejects remote and credential-bearing targets', () => {
  for (const url of ['https://example.com', 'http://127.0.0.1@evil.com', 'file:///etc/passwd']) {
    assert.throws(() => imageEngineConfig({ SOFIA_IMAGE_ENGINE_URL: url }));
  }
});
test('allows loopback worker', () => assert.equal(imageEngineConfig({ SOFIA_IMAGE_ENGINE_URL: 'http://127.0.0.1:3000' }).configured, true));
test('status does not falsely claim inference success', async () => {
  const req = { url: '/api/image-engine/status', method: 'GET' };
  let status, data;
  const res = { writeHead: n => { status = n; }, end: s => { data = JSON.parse(s); } };
  assert.equal(await imageEngineHandler(req, res, {}), true);
  assert.equal(status, 200);
  assert.equal(data.inferenceVerified, false);
});
