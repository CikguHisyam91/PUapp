/* Pilihan tema: Mod Normal ☀️ / Mod Malam 🌙
 * Dimuatkan dalam <head> supaya warna betul sejak awal (tiada kelipan).
 * Pilihan disimpan di telefon; kali pertama ikut tetapan telefon. */
(function () {
  var KUNCI = 'sp_tema', h = document.documentElement;
  function simpanan() { try { return localStorage.getItem(KUNCI); } catch (e) { return null; } }
  function lalai() { return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'normal' : 'malam'; }
  function pasang(t) {
    h.setAttribute('data-tema', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'normal' ? '#F4F2ED' : '#0B0D11');
    document.querySelectorAll('.tukarTema').forEach(kemasButang);
  }
  function kemasButang(b) {
    var normal = h.getAttribute('data-tema') === 'normal';
    b.textContent = normal ? '🌙' : '☀️';
    b.setAttribute('aria-label', normal ? 'Tukar ke Mod Malam' : 'Tukar ke Mod Normal');
    b.title = b.getAttribute('aria-label');
  }
  window.tukarTema = function () {
    var t = h.getAttribute('data-tema') === 'normal' ? 'malam' : 'normal';
    try { localStorage.setItem(KUNCI, t); } catch (e) {}
    pasang(t);
  };
  pasang(simpanan() || lalai());
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: light)');
    var ikut = function () { if (!simpanan()) pasang(lalai()); };
    if (mq.addEventListener) mq.addEventListener('change', ikut); else if (mq.addListener) mq.addListener(ikut);
  }
  // Letak butang dalam kepala halaman (sebelum butang Keluar); jika tiada kepala, butang terapung di penjuru
  function letak() {
    var hd = document.querySelector('header');
    var b = document.querySelector('.tukarTema');
    if (hd) {
      if (b && hd.contains(b)) return;
      if (b) b.remove();
      b = document.createElement('button'); b.type = 'button'; b.className = 'tukarTema'; b.onclick = window.tukarTema;
      var akhir = hd.querySelector('button:last-of-type, a.btn:last-of-type, a.kecil:last-of-type');
      if (akhir && akhir.parentNode === hd) hd.insertBefore(b, akhir); else hd.appendChild(b);
    } else {
      if (b) return;
      b = document.createElement('button'); b.type = 'button'; b.className = 'tukarTema apung'; b.onclick = window.tukarTema;
      document.body.appendChild(b);
    }
    kemasButang(b);
  }
  function mula() { letak(); new MutationObserver(letak).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mula); else mula();
})();
