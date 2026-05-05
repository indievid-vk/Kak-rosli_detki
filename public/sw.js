const CACHE_NAME = 'pwa-diary-v124';

/* Version 124 - Enhanced Offline Support & Search Params Handling */

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
    console.log('[SW] Install event started');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching critical assets');
                return Promise.allSettled(
                    urlsToCache.map(url => {
                        return cache.add(url).catch(err => console.warn(`[SW] Failed to cache ${url}:`, err));
                    })
                );
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activate event started');
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
        }).then(() => {
            console.log('[SW] Taking control of clients');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip dev tools, vite internal stuff, HMR etc.
    if (
        url.hostname === 'localhost' || 
        url.pathname.includes('@vite') || 
        url.pathname.includes('node_modules') ||
        url.pathname.includes('.vite')
    ) {
        return;
    }

    // STRATEGY: Network First for navigation (index.html), Cache First for assets
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('./', { ignoreSearch: true }) || 
                       caches.match('index.html', { ignoreSearch: true });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
            if (cachedResponse) {
                // Background update: fetch fresh version and update cache
                fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                }).catch(() => {/* Ignore background update errors */});
                
                return cachedResponse;
            }

            return fetch(event.request).then(networkResponse => {
                // Cache it for next time if it's a basic request
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(err => {
                // Return nothing if both fail
                console.log('[SW] Fetch failed for:', event.request.url);
                
                // For images, we could return a placeholder here if we wanted
                // if (event.request.destination === 'image') return caches.match('icon-192.png');
            });
        })
    );
});
