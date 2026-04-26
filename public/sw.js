const CACHE_NAME = 'pwa-diary-v111';

// We only cache the core entry point and manifest. 
// Other assets are handled by the browser or runtime cache.
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'pwa-setup.js',
  'icon-512.png',
  'apple-icon.png'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core assets');
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
                        console.log('[SW] Deleting old cache:', cacheName);
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

    // Don't cache dev server stuff
    if (url.hostname === 'localhost' || url.pathname.includes('@vite') || url.pathname.includes('node_modules')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            // Return from cache if found
            if (response) {
                return response;
            }

            // Otherwise, fetch from network
            return fetch(event.request).then(networkResponse => {
                // If it's a valid response, we could cache it here (runtime cache), 
                // but for now we stay lean to avoid "white screen" on build changes.
                return networkResponse;
            }).catch(() => {
                // Return index.html for navigation requests when offline
                if (event.request.mode === 'navigate') {
                    return caches.match('./') || caches.match('index.html');
                }
            });
        })
    );
});
