const CACHE_NAME = 'media-cache-v1';
const BGM_PATH = 'bgm.mp3';

self.addEventListener('install', event => {
  self.skipWaiting();
  // 事前にキャッシュしておくことも可能ですが、初回のfetch時にキャッシュします
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // bgm.mp3 のみを強力にキャッシュする（その他の通信はそのまま）
  if (url.pathname.endsWith(BGM_PATH)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        // キャッシュがあれば即座に返す（通信を発生させない）
        if (response) {
          return response;
        }
        // なければネットワークから取得してキャッシュに保存
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
