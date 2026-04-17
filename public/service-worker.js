const CACHE_NAME = 'kak-rosli-detki-v1';
const RUNTIME_CACHE = 'kak-rosli-detki-runtime-v1';

const PRECACHE_URLS = [
  '/Kak-rosli_detki/',
  '/Kak-rosli_detki/index.html',
  '/Kak-rosli_detki/manifest.json',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => cacheNames.filter((cacheName) => !currentCaches.includes(cacheName)))
      .then((cachesToDelete) => Promise.all(cachesToDelete.map((cache) => caches.delete(cache))))
      .then(() => self.clients.claim())
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
