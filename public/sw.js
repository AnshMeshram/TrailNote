// Trailnote Hand-Written PWA Service Worker
// Version: trailnote-v1.2
const CACHE_NAME = 'trailnote-v1.2';

const APP_SHELL_URLS = [
  '/',
  '/plan',
  '/trail',
  '/trail-card',
  '/walk',
  '/field-notes',
  '/journal',
  '/settings',
  '/field-test',
  '/manifest.json',
  '/icon.svg',
  '/logo.svg',
  '/images/trailnote-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_URLS).catch((err) => {
        console.warn('[SW] Non-fatal app shell caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Clearing outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first strategy for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              message: 'Device offline. Using local built-in naturalist store.',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        })
    );
    return;
  }

  // Stale-while-revalidate / Cache-first for navigation and app shell assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
