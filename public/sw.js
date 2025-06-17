// public/sw.js
self.addEventListener('install', (event) => {
    console.log('[SW] Installed');
    event.waitUntil(
        caches.open('clipboard-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/favicon.ico',
                '/manifest.json',
                '/icon-192.png',
                '/icon-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request);
        })
    );
});
