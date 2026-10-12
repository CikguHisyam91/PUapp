/* Service worker SilatApp: membolehkan pemasangan ke skrin utama & buka laju.
   Laman sentiasa cuba ambil versi terkini dari internet dahulu (network-first). */
const CACHE = 'silatapp-v1';
const ASAS = ['./', './index.html', './ibubapa.html', './bersama.js', './logo.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASAS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // API Google tidak disentuh
  e.respondWith(fetch(e.request).then(r => { const s = r.clone(); caches.open(CACHE).then(c => c.put(e.request, s)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
