const CACHE_NAME = "sofia-studio-shell-v5";
const CORE_ASSETS = [
  "/", "/index.html", "/style.css?v=blue-grey-1", "/app.js", "/device-view.js", "/screen-wake-lock.js", "/pwa.js",
  "/exercise-image-library.js", "/image-review-store.js",
  "/original-visual-storyboards.js", "/advanced-catalog.js",
  "/storyboard-prompts.js", "/review-system.js",
  "/manifest.webmanifest", "/icons/sofia-icon-192.png",
  "/icons/sofia-icon-512.png", "/icons/sofia-icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("sofia-studio-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put("/", response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match("/")) || (await caches.match("/index.html"))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => {
    const refresh = fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    });
    return cached || refresh;
  }));
});
