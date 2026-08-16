const CACHE_NAME = 'antigravity-4k-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy to prevent stale/broken WebGL assets in mobile
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
