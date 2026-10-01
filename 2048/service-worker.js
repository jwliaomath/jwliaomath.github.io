const CACHE_NAME = "junwen-2048-v5";
const APP_FILES = ["./", "./index.html", "./styles.css", "./game.js", "./i18n.js", "./engine.js", "./manifest.webmanifest", "./icon.svg", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("junwen-2048-") && key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (!new URL(request.url).pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
      }
      return response;
    }).catch(async () =>
      (await caches.match(request, { ignoreSearch: true })) ||
      (request.mode === "navigate" ? await caches.match("./index.html") : Response.error()),
    ),
  );
});
