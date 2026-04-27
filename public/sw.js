const CACHE_NAME = 'pwa-diary-v115';

const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'pwa-setup.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip dev and cross-origin
    if (url.hostname === 'localhost' || url.pathname.includes('@vite')) return;

    // STRATEGY: Network First for index.html/navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('./') || caches.match('index.html');
            })
        );
        return;
    }

    // STRATEGY: Cache First (with background update) for other static assets
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Cache successful responses from our own origin
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Silently fail fetch if offline
            });

            return cachedResponse || fetchPromise;
        })
    );
});
