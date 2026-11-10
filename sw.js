/* Service worker SilatApp: pemasangan ke skrin utama & buka LAJU.
   Strategi "stale-while-revalidate": halaman dibuka serta-merta dari simpanan telefon,
   kemudian versi terkini diambil di belakang untuk kali seterusnya.
   Naikkan nombor CACHE setiap kali fail dikemas kini supaya semua telefon dapat versi baharu. */
const CACHE = 'silatapp-v20';
const ASAS = ['./', './index.html', './ibubapa.html', './daftar.html', './panduan-ibubapa.html', './privasi.html', './teks-pdpa.js', './glass.css', './tema.js', './bersama.js', './qrcode.js', './poster.js', './logo.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASAS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
const LUAR_TALIAN = () => new Response(
  '<meta name=viewport content="width=device-width"><body style="background:#0B0D11;color:#ECEDEF;font:16px sans-serif;padding:30px;text-align:center">Tiada sambungan internet.<br><br><button onclick="location.reload()">Cuba lagi</button></body>',
  { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // API Google tidak disentuh
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(lama => {
    const baru = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (lama) { e.waitUntil(baru); return lama; }
    return baru.then(r => r || LUAR_TALIAN());
  })));
});
