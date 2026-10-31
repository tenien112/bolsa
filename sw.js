// BOLSA-LORENCITO. Siempre pide la app nueva a la red (sin caché del navegador); solo usa lo guardado si no hay conexión.
const CACHE = "bolsa-v23";
const APP = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP.map(u => new Request(u, {cache: "reload"}))))); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== "GET") return;
  // La página se pide con una marca de tiempo para saltarse también la caché de GitHub
  const pide = e.request.mode === "navigate"
    ? fetch(url.pathname + "?v=" + Date.now(), {cache: "no-store"})
    : fetch(e.request, {cache: "no-store"});
  e.respondWith(pide.then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
