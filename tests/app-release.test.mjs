import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { checkRelease } from '../src/services/app-release.ts';

test('release checks bypass HTTP caches and distinguish current/new/failed metadata', async () => {
  let url, options;
  const current = async (u, init) => { url = u; options = init; return new Response(JSON.stringify({ id: 'current' })); };
  assert.equal(await checkRelease('current', current), false);
  assert.match(url, /^\/version.json\?t=\d+$/);
  assert.equal(options.cache, 'no-store');
  assert.equal(await checkRelease('old', current), true);
  await assert.rejects(checkRelease('old', async () => new Response('{}')));
  await assert.rejects(checkRelease('old', async () => new Response('unavailable', { status: 503 })));
  await assert.rejects(checkRelease('old', async () => { throw Error('offline'); }));
});

test('mobile app has a distinct installation identity and standalone launch', async () => {
  const read = path => readFile(new URL(path, import.meta.url), 'utf8');
  const desktop = JSON.parse(await read('../public/manifest.webmanifest'));
  const mobile = JSON.parse(await read('../public/manifest-mobile.webmanifest'));
  assert.equal(desktop.id, '/');
  assert.equal(mobile.id, '/mobile/');
  assert.equal(mobile.start_url, '/mobile/');
  assert.equal(mobile.scope, '/mobile/');
  assert.equal(mobile.display, 'standalone');
  assert.match(mobile.name, /Mpempa/);
  assert.match(await read('../mobile.html'), /href="\/manifest-mobile.webmanifest"/);
  const deploy = JSON.parse(await read('../vercel.json'));
  assert.ok(deploy.rewrites.some(rule => rule.source === '/mobile/:path*' && rule.destination === '/mobile.html'));
});

test('worker never caches release metadata and keeps separate mobile offline navigation', async () => {
  const handlers = {};
  let matchKey, cacheKey, mode;
  const cache = { match: async key => { matchKey = key; return new Response('offline'); }, put: async key => { cacheKey = key; } };
  let offline = false;
  const fetcher = async (_request, options) => { mode = options.cache; if (offline) throw Error('offline'); return new Response('fresh'); };
  vm.runInNewContext(await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self: { location: { origin: 'https://studio.test' }, addEventListener: (name, fn) => { handlers[name] = fn; } },
    caches: { open: async () => cache }, URL, Response, fetch: fetcher,
  });
  for (const path of ['/version.json', '/sw.js', '/api/chat']) {
    handlers.fetch({ request: { method: 'GET', mode: 'cors', url: `https://studio.test${path}` }, respondWith: () => assert.fail(path) });
  }
  let response;
  const request = { method: 'GET', mode: 'navigate', url: 'https://studio.test/mobile/' };
  handlers.fetch({ request, respondWith: r => { response = r; } });
  assert.equal(await (await response).text(), 'fresh');
  assert.equal(cacheKey, '/mobile/');
  assert.equal(mode, 'no-store');
  offline = true;
  handlers.fetch({ request, respondWith: r => { response = r; } });
  assert.equal(await (await response).text(), 'offline');
  assert.equal(matchKey, '/mobile/');
});
