const CACHE = 'soduko-ebd7b8ad85ef';
const FILES = [
  './', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './src/styles.css', './src/main.js', './src/sudoku.js', './src/game-rules.js',
  './src/records.js', './src/puzzle-service.js', './src/puzzle-worker.js',
  './src/puzzle-bank.js', './src/puzzle.js', './src/rater.js', './src/hint-plan.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('soduko-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
