const CACHE_NAME = 'leite-certo-v2';
const CACHED_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Admin nunca é cacheado
const NO_CACHE = ['/admin.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHED_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Nunca cachear admin
  if (NO_CACHE.some(p => url.pathname.includes(p))) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Nunca cachear chamadas ao Supabase
  if (url.hostname.includes('supabase')) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
