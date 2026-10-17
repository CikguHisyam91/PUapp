/* Service worker SilatApp: membolehkan pemasangan ke skrin utama & buka laju.
   Laman sentiasa cuba ambil versi terkini dari internet dahulu (network-first). */
const CACHE = 'silatapp-v5';
const ASAS = ['./', './index.html', './ibubapa.html', './daftar.html', './bersama.js', './qrcode.js', './poster.js', './logo.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASAS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // API Google tidak disentuh
  e.respondWith(fetch(e.request).then(r => { const s = r.clone(); caches.open(CACHE).then(c => c.put(e.request, s)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || new Response(
      '<meta name=viewport content="width=device-width"><body style="background:#0F1115;color:#E8E9EC;font:16px sans-serif;padding:30px;text-align:center">Tiada sambungan internet.<br><br><button onclick="location.reload()">Cuba lagi</button></body>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))));
});
