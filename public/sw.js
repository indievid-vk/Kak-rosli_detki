const CACHE_NAME = 'pwa-diary-v114';

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

    // STRATEGY: Cache First for other static assets
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                // Return nothing if asset not found and offline
            });
        })
    );
});
