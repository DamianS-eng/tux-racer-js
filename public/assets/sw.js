const cacheName = "offline-cache-v1';
const offlineURL = '/index.html';
//const offlineURL = '/offline.html';

self.addEventListener('install', event => {
  event.waitUntil(
      caches.open(cacheName).then(cache => cache.add(offlineURL))
    );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.map(key => {
          if (key !== cacheName) return caches.delete(key);
        }))
      )
    );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
      fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(cacheName).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(response => {
          return response || caches.match(offlineURL);
        });
      });
    );
});
