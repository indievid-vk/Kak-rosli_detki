const CACHE_NAME = 'pwa-diary-v110';

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
                console.log('[SW] Кэширование начальных ресурсов');
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
                        console.log('[SW] Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Пропускаем не-GET запросы и запросы к HMR/Vite внутренностям
    if (event.request.method !== 'GET' || event.request.url.includes('node_modules') || event.request.url.includes('@vite')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Если есть в кэше — возвращаем
                if (response) {
                    return response;
                }
                
                // Иначе идем в сеть
                return fetch(event.request).then(networkResponse => {
                    // Не кэшируем динамические запросы или ошибки
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Кэшируем только важные статические файлы (опционально)
                    // Для разработки сейчас лучше просто возвращать сеть
                    return networkResponse;
                }).catch(() => {
                    // Если сеть упала и это навигация — возвращаем index.html из кэша
                    if (event.request.mode === 'navigate') {
                        return caches.match('./');
                    }
                });
            })
    );
});
