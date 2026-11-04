const CACHE_NAME = 'mpempa-studio-__MPEMPA_BUILD_ID__';
const PRECACHE = /*__PRECACHE__*/[];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mpempa-studio-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const documentRequest = request.mode === 'navigate';
  const libraryData = /^\/data\/[\w-]+\.(json|js)$/.test(url.pathname);
  const asset = /^\/assets\/.+-[\w-]+\.(js|css)$/.test(url.pathname);
  if (!documentRequest && !libraryData && !asset) return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const key = documentRequest ? (url.pathname.startsWith('/mobile') ? '/mobile/' : '/') : request;
    if (asset) { const cached = await cache.match(key); if (cached) return cached; }
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) await cache.put(key, response.clone());
      return response;
    } catch {
      return (await cache.match(key)) || Response.error();
    }
  }));
});
