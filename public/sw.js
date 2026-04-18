const CACHE_NAME = 'pwa-cache-v3';

// Используем полные пути для GitHub Pages, чтобы избежать ошибок 404 в Service Worker
const urlsToCache = [
  '/Kak-rosli_detki/',
  '/Kak-rosli_detki/index.html',
  '/Kak-rosli_detki/manifest.json',
  '/Kak-rosli_detki/icon-192.png',
  '/Kak-rosli_detki/icon-512.png',
  '/Kak-rosli_detki/pwa-setup.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Кэш открыт, сохраняем ресурсы');
                // Используем подход, при котором ошибки в одном файле не блокируют весь кэш
                return Promise.allSettled(urlsToCache.map(url => cache.add(url)));
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
