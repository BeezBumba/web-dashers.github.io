const KEY = 'GDV6';

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

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Skip GD API + proxy + POST requests
    if (
        event.request.method !== 'GET' ||
        url.includes('getGJSongInfo.php') ||
        url.includes('downloadGJLevel22.php') ||
        url.includes('geometrydashfiles.b-cdn.net') ||
        url.includes('proxy.corsfix.com')
    ) {
        return;
    }

    event.respondWith(
        caches.open(KEY).then(async (cache) => {
            const cached = await cache.match(event.request);

            // Start network fetch in background
            const networkFetch = fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                })
                .catch(() => null);

            // Return cached immediately if available
            return cached || networkFetch;
        })
    );
});
