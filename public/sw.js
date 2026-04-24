const CACHE_NAME = 'pwa-cache-v5';

self.addEventListener('install', event => {
    // Не кэшируем жестко заранее, чтобы не блокировать установку SW при ошибке 404
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    // Минимальный fetch handler требуется для PWA prompt
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

