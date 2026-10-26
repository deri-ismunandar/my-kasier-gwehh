// Service Worker Offline PWA derimakasii (Disinkronkan dengan File Lokal)
const CACHE_NAME = 'derimakasii-pwa-v8';

const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './Minimalist White Checklist Logo.png',
    './tailwindcss.js',
    './fontawesome.css',
    './chart.js',
    './html2canvas.js',
    './xlsx.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching all local static assets...');
            return Promise.allSettled(
                STATIC_ASSETS.map(url => cache.add(url).catch(err => console.error('Gagal cache:', url, err)))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});