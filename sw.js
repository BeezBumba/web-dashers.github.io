const KEY = 'GD';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle initial caching
self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(KEY).then((cache) => {
                return cache.addAll(event.data.payload);
            })
        );
    }
});

// Fetch handler
self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      try {
        const cached = await caches.match(e.request);
        if (cached) {
          console.log(`[SW] Cache hit: ${e.request.url}`);
          return cached;
        }

        console.log(`[SW] Fetching: ${e.request.url}`);
        const response = await fetch(e.request);

        const cache = await caches.open(KEY);
        cache.put(e.request, response.clone());

        return response;
      } catch (err) {
        console.error(`[SW] Fetch failed: ${err}`);
      }
    })()
  );
});
