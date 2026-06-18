const CACHE_NAME = 'math-records-v1';
const APP_SHELL = [
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/app.js',
  '/js/aiAnalyze.js',
  '/js/analysisList.js',
  '/js/backup.js',
  '/js/conditionHint.js',
  '/js/constants.js',
  '/js/imageUtils.js',
  '/js/recordForm.js',
  '/js/reviewList.js',
  '/js/stats.js',
  '/js/storage.js',
  '/js/suggestions.js',
  '/js/tagPicker.js',
  '/js/utils.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
