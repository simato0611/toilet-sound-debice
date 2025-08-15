// 音姫Webアプリ - Service Worker

const CACHE_NAME = 'otohime-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon-72.png',
    '/icon-96.png',
    '/icon-128.png',
    '/icon-144.png',
    '/icon-152.png',
    '/icon-192.png',
    '/icon-384.png',
    '/icon-512.png'
];

// インストール時
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('キャッシュの追加に失敗しました:', error);
            })
    );
});

// アクティベート時
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除しました:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチ時
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにある場合はそれを返す
                if (response) {
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                return fetch(event.request)
                    .then((response) => {
                        // レスポンスが無効な場合はそのまま返す
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // ネットワークエラーの場合はオフラインページを返す
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// バックグラウンド同期（将来の機能拡張用）
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('バックグラウンド同期実行');
    }
});

// プッシュ通知（将来の機能拡張用）
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        
        event.waitUntil(
            self.registration.showNotification('音姫', options)
        );
    }
});

// 通知クリック時
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});