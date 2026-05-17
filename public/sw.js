const CACHE_NAME = 'pwa-diary-v125';

/* Version 125 - Robust Offline Support */

const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'pwa-setup.js',
  'icon-192.png',
  'icon-512.png',
  'apple-icon.png',
  'maskable-icon-512.png'
];

self.addEventListener('install', event => {
    console.log('[SW] Install: caching shell');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.allSettled(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(err => console.warn(`[SW] Initial cache failed for ${url}:`, err));
                    })
                );
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate: cleaning old caches');
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

    // Skip development-only resources
    if (
        url.hostname === 'localhost' || 
        url.pathname.includes('@vite') || 
        url.pathname.includes('node_modules') ||
        url.pathname.includes('.vite')
    ) {
        return;
    }

    // Navigation requests: Network-First (with offline fallback to index.html)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('./', { ignoreSearch: true }) || 
                       caches.match('index.html', { ignoreSearch: true });
            })
        );
        return;
    }

    // Assets: Stale-While-Revalidate strategy
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Cache successful responses
                // We allow 'cors' and 'opaque' (type 'opaque' is for CDN assets like Google Fonts)
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(err => {
                console.log('[SW] Network failed for:', event.request.url);
                // If network fails and no cache, we just let it fail or return fallback image
            });

            return cachedResponse || fetchPromise;
        })
    );
});
