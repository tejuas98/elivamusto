const CACHE_NAME = 'zersap-v1';
const ASSETS = [
  '/elivamusto/',
  '/elivamusto/index.html',
  '/elivamusto/manifest.json',
  'https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Rubik+Mono+One&family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
