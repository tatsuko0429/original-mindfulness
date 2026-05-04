/*
  開発者向け保守メモ（2026年4月27日時点 / 2026年5月4日追記）
  この Service Worker は PWA 全体のオフライン化ではなく、index.html の BGM 再生を安定させるために bgm.mp3 だけを Cache Storage へ保存します。
  HTML/CSS/JS や画像をここでキャッシュし始めると、画面修正後も古い index.html が残る回帰リスクがあるため、対象を増やす場合は更新戦略と CACHE_NAME の更新を同時に設計してください。
  bgm.mp3 を差し替えた場合は、ファイル名を変えるか CACHE_NAME を上げて、既存端末の古い音声キャッシュが残らないことを確認してください。
*/
const CACHE_NAME = 'media-cache-v1';
const BGM_PATH = 'bgm.mp3';

self.addEventListener('install', event => {
  self.skipWaiting();
  // 事前キャッシュではなく初回 fetch 時に保存します。インストール失敗でアプリ起動を妨げないための運用です。
});

self.addEventListener('activate', event => {
  // 新しい Service Worker をすぐ既存ページへ適用します。キャッシュ削除処理は現在持たないため、CACHE_NAME 変更時はここに整理処理を追加してください。
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
