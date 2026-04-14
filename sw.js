const KEY = 'GDV2';

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

// Fetch handler - cache first
self.addEventListener('fetch', (e) => {
    e.respondWith(
        (async () => {
            const cache = await caches.open(KEY);
            const cached = await cache.match(e.request);

            if (cached) {
                console.log(`[SW] Cache hit: ${e.request.url}`);
                return cached;
            }

            try {
                console.log(`[SW] Fetching from network: ${e.request.url}`);
                const response = await fetch(e.request);

                if (response && response.ok) {
                    await cache.put(e.request, response.clone());
                }

                return response;
            } catch (err) {
                console.error(`[SW] Fetch failed: ${err}`);
                throw err;
            }
        })()
    );
});
