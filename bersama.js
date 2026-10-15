/* Fail kongsi: SilatApp Pusat (index.html) & Portal Ibu Bapa (ibubapa.html) */
/* ====== KATEGORI USIA & KELAS BERAT (dari jadual rasmi cikgu) ======
   umur = tahun semasa − tahun lahir.  kelas: [nama, berat min (kg), berat maks (kg) / null = Bebas]
   Berat dikira masuk kelas jika: berat min < berat ≤ berat maks.
   Umur bertindih (cth. 16 = Remaja & Sukma, 35 = Terbuka & Master 2) → semua kategori layak dipaparkan. */
const KATEGORI_USIA = [
  { nama: "PRA TUNAS", umur: "5-6", min: 5, max: 6, kelas: [["Kelas A", 15, 18], ["Kelas B", 18, 21], ["Kelas C", 21, 24], ["Kelas Bebas", 24, null]] },
  { nama: "TUNAS", umur: "7-8", min: 7, max: 8, kelas: [["Kelas A", 16, 19], ["Kelas B", 19, 22], ["Kelas C", 22, 25], ["Kelas D", 25, 28], ["Kelas E", 28, 31], ["Kelas Bebas", 31, null]] },
  { nama: "PRA DINI", umur: "9-10", min: 9, max: 10, kelas: [["Kelas A", 18, 21], ["Kelas B", 21, 24], ["Kelas C", 24, 27], ["Kelas D", 27, 30], ["Kelas E", 30, 33], ["Kelas Bebas", 33, null]] },
  { nama: "DINI", umur: "11-12", min: 11, max: 12, kelas: [["Kelas A", 24, 28], ["Kelas B", 28, 32], ["Kelas C", 32, 36], ["Kelas D", 36, 40], ["Kelas E", 40, 44], ["Kelas F", 44, 48], ["Kelas G", 48, 52], ["Kelas H", 52, 56], ["Kelas I", 56, 60], ["Kelas Bebas", 60, null]] },
  { nama: "PRA REMAJA", umur: "13-14", min: 13, max: 14, kelas: [["Kelas A", 33, 37], ["Kelas B", 37, 41], ["Kelas C", 41, 45], ["Kelas D", 45, 49], ["Kelas E", 49, 53], ["Kelas F", 53, 57], ["Kelas G", 57, 61], ["Kelas H", 61, 65], ["Kelas Bebas", 65, null]] },
  { nama: "REMAJA", umur: "15-16", min: 15, max: 16, kelas: [["Kelas A", 39, 43], ["Kelas B", 43, 47], ["Kelas C", 47, 51], ["Kelas D", 51, 55], ["Kelas E", 55, 59], ["Kelas F", 59, 63], ["Kelas G", 63, 67], ["Kelas H", 67, 71], ["Kelas I", 71, 75], ["Kelas Bebas", 75, null]] },
  { nama: "SUKMA", umur: "16-20", min: 16, max: 20, kelas: [["Kelas A", 45, 50], ["Kelas B", 50, 55], ["Kelas C", 55, 60], ["Kelas D", 60, 65], ["Kelas E", 65, 70], ["Kelas F", 70, 75], ["Kelas G", 75, 80], ["Kelas H", 80, 85], ["Kelas Bebas", 85, null]] },
  { nama: "TERBUKA", umur: "21-35", min: 21, max: 35, kelas: [["Kelas A", 45, 50], ["Kelas B", 50, 55], ["Kelas C", 55, 60], ["Kelas D", 60, 65], ["Kelas E", 65, 70], ["Kelas F", 70, 75], ["Kelas G", 75, 80], ["Kelas H", 80, 85], ["Kelas Bebas", 85, null]] },
  { nama: "MASTER 2", umur: "35-45", min: 35, max: 45, kelas: [["Kelas A", 45, 50], ["Kelas B", 50, 55], ["Kelas C", 55, 60], ["Kelas D", 60, 65], ["Kelas E", 65, 70], ["Kelas F", 70, 75], ["Kelas G", 75, 80], ["Kelas H", 80, 85], ["Kelas I", 85, 90], ["Kelas J", 90, 95], ["Kelas Bebas", 95, null]] },
  { nama: "MASTER 1", umur: "45+", min: 45, max: 200, kelas: [["Kelas A", 45, 50], ["Kelas B", 50, 55], ["Kelas C", 55, 60], ["Kelas D", 60, 65], ["Kelas E", 65, 70], ["Kelas F", 70, 75], ["Kelas G", 75, 80], ["Kelas H", 80, 85], ["Kelas I", 85, 90], ["Kelas J", 90, 95], ["Kelas Bebas", 95, null]] }
];
/* ================================================================ */


/* Turutan bengkung rasmi. [nama, warna utama, warna cula] */
const BENGKUNG_DEF = [
  ['Hitam Kosong (Ahli Baharu)', '#111', ''],
  ['Hitam Cula Putih 1', '#111', '#fff'], ['Hitam Cula Putih 2', '#111', '#fff'], ['Hitam Cula Putih 3', '#111', '#fff'],
  ['Putih', '#f2f2f2', ''], ['Putih Cula Biru 1', '#f2f2f2', '#2f6fd6'], ['Putih Cula Biru 2', '#f2f2f2', '#2f6fd6'],
  ['Biru', '#2f6fd6', ''], ['Biru Cula Hijau 1', '#2f6fd6', '#2fa65a'], ['Biru Cula Hijau 2', '#2f6fd6', '#2fa65a'],
  ['Hijau', '#2fa65a', ''], ['Hijau Cula Merah 1', '#2fa65a', '#d63c3c'], ['Hijau Cula Merah 2', '#2fa65a', '#d63c3c'],
  ['Merah (Jurulatih Muda)', '#d63c3c', ''], ['Merah Cula Kuning 1 (Jurulatih)', '#d63c3c', '#f1c232'], ['Merah Cula Kuning 2 (Jurulatih Kanan)', '#d63c3c', '#f1c232'],
  ['Kuning (Gurulatih Muda)', '#f1c232', ''], ['Kuning Cula Hitam 1 (Gurulatih)', '#f1c232', '#111'], ['Kuning Cula Hitam 2 (Gurulatih Kanan)', '#f1c232', '#111'],
  ['Hitam Cula Kuning 1 (Guru Muda)', '#111', '#f1c232'], ['Hitam Cula Kuning 2 (Guru Wilayah)', '#111', '#f1c232'], ['Hitam Cula Kuning 3 (Guru Wilayah Kanan)', '#111', '#f1c232']
];
const BENGKUNG = BENGKUNG_DEF.map(b => b[0]);
/* Padankan teks bengkung (termasuk dari sistem lama, cth. "BENGKUNG HITAM KOSONG (AHLI BAHARU)") kepada senarai rasmi */
const kunciB = v => String(v || '').toUpperCase().replace(/\(.*?\)/g, '').replace(/^\s*BENGKUNG\s+/, '').replace(/[^A-Z0-9]+/g, ' ').trim();
function indeksBengkung(v) {
  const k = kunciB(v); if (!k) return -1;
  let i = BENGKUNG.findIndex(b => kunciB(b) === k);
  if (i < 0) i = BENGKUNG.findIndex(b => kunciB(b) === k + ' 1');
  return i;
}
const namaBengkung = v => { const i = indeksBengkung(v); return i >= 0 ? BENGKUNG[i] : (v || ''); };
const pilihBengkung = (id, v, dis) => { const i = indeksBengkung(v);
  return `<select id="${id}" ${dis || ''}>${i < 0 && v ? `<option selected>${esc(v)}</option>` : ''}${BENGKUNG.map((b, j) => `<option ${j === i ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`; };
const jalur = i => { const d = BENGKUNG_DEF[i] || ['', '#555', ''];
  return `<span style="display:inline-block;width:28px;height:12px;border-radius:3px;background:${d[1]};border:1px solid #555;position:relative;flex:none;overflow:hidden">${d[2] ? `<span style="position:absolute;right:4px;top:0;bottom:0;width:6px;background:${d[2]}"></span>` : ''}</span>`; };

function kategoriUsia(umur) { return umur == null ? [] : KATEGORI_USIA.filter(k => umur >= k.min && umur <= k.max); }
const namaKat = kats => kats.length ? kats.map(k => k.nama).join(' / ') : 'Tiada kategori';
function kelasBerat(kat, berat) {
  if (!kat || !(berat > 0)) return '';
  const k = kat.kelas.find(c => berat > c[1] && (c[2] == null || berat <= c[2]));
  if (k) return k[2] == null ? `${k[0]} (>${k[1]} kg)` : `${k[0]} (${k[1]}–${k[2]} kg)`;
  return `Bawah had (≤${kat.kelas[0][1]} kg)`;
}
function infoBMI(berat, tinggi) {
  if (!(berat > 0 && tinggi > 0)) return null;
  const m = tinggi / 100, bmi = berat / (m * m), min = 18.5 * m * m, max = 24.9 * m * m;
  const [k, w] = bmi < 18.5 ? ['Kurang berat', 'BIRU'] : bmi < 25 ? ['Normal', 'HIJAU'] : bmi < 30 ? ['Berlebihan', 'KUNING'] : ['Obes', 'MERAH'];
  const beza = berat < min ? `Naik ${(min - berat).toFixed(1)} kg` : berat > max ? `Turun ${(berat - max).toFixed(1)} kg` : 'Dalam julat ideal ✓';
  return { bmi: bmi.toFixed(1), k, w, ideal: `${min.toFixed(1)} – ${max.toFixed(1)} kg`, beza };
}

/* ====== Pasang ke skrin utama (PWA) — popup sekali sahaja ====== */
function pasangApp(namaApp, kunci) {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const sudahApp = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let pernah = false; try { pernah = !!localStorage.getItem(kunci); } catch (e) {}
  if (sudahApp || pernah) return;
  const tandai = () => { try { localStorage.setItem(kunci, '1'); } catch (e) {} };
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
  const papar = (isi, butang) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:flex-end;justify-content:center';
    d.innerHTML = `<div style="background:#181B22;color:#E8E9EC;border:1px solid #2C313C;border-radius:20px 20px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom));width:100%;max-width:520px;font:15px/1.5 system-ui,sans-serif">
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px"><img src="icon-192.png" style="width:60px;height:60px;border-radius:14px;background:#fff">
      <div><b style="font-size:17px">Pasang ${namaApp}</b><div style="color:#9097A3;font-size:13px">Buka terus dari skrin utama telefon, macam app.</div></div></div>
      ${isi}<div style="display:flex;gap:10px;margin-top:16px">
      <button id="pwaTidak" style="flex:1;min-height:46px;border-radius:12px;border:1px solid #2C313C;background:#20242D;color:#E8E9EC;font:inherit">Nanti</button>
      ${butang ? `<button id="pwaYa" style="flex:1;min-height:46px;border-radius:12px;border:0;background:#E2B55A;color:#1a1405;font:inherit;font-weight:700">📲 Pasang</button>` : ''}</div></div>`;
    document.body.appendChild(d);
    const tutup = () => { d.remove(); tandai(); };
    d.querySelector('#pwaTidak').onclick = tutup;
    return { d, tutup };
  };
  if (ios) {
    setTimeout(() => papar(`<ol style="margin:0;padding-left:20px;color:#E8E9EC">
      <li>Tekan butang <b>Kongsi</b> <span style="display:inline-block;border:1px solid #9097A3;border-radius:4px;padding:0 5px">⬆︎</span> di bawah skrin Safari</li>
      <li>Pilih <b>Add to Home Screen</b> / <b>Tambah ke Skrin Utama</b></li><li>Tekan <b>Add</b></li></ol>`, false), 2500);
    return;
  }
  window.addEventListener('beforeinstallprompt', ev => {
    ev.preventDefault();
    setTimeout(() => {
      const p = papar('', true);
      p.d.querySelector('#pwaYa').onclick = async () => { p.tutup(); ev.prompt(); try { await ev.userChoice; } catch (e) {} };
    }, 1500);
  });
}

/* fetch dengan had masa (elak skrin tersangkut jika internet / pelayan lambat) */
function fetchMasa(url, opt, ms) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 25000);
  return fetch(url, Object.assign({}, opt, { signal: c.signal })).finally(() => clearTimeout(t));
}

/* Jika berlaku ralat tidak dijangka, papar mesej (bukan skrin hitam kosong) */
window.addEventListener('error', e => {
  const a = document.getElementById('app'); if (!a || a.dataset.ralat) return; a.dataset.ralat = 1;
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;background:#3a2020;color:#fff;border-radius:12px;padding:12px;font:13px sans-serif;z-index:300';
  d.innerHTML = 'Ralat: ' + String(e.message || e).replace(/</g, '&lt;') + '<br><button onclick="location.reload()" style="margin-top:8px">Muat semula</button>';
  document.body.appendChild(d);
});

/* ====== Jadual latihan (dikongsi: aplikasi jurulatih & Portal Ibu Bapa) ====== */
const HARI_JADUAL = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU', 'AHAD'];
const hariIni = () => HARI_JADUAL[(new Date().getDay() + 6) % 7];
const jam12 = t => { if (!t) return ''; let [h, m] = t.split(':').map(Number); const p = h >= 12 ? 'ptg' : 'pg'; if (h >= 19) return `${h - 12}:${String(m).padStart(2, '0')} mlm`; if (h > 12) h -= 12; if (h === 0) h = 12; return `${h}:${String(m).padStart(2, '0')} ${p}`; };
function slotSeterusnya(list) {
  if (!list.length) return null;
  const k = new Date(), hi = (k.getDay() + 6) % 7, kini = `${String(k.getHours()).padStart(2, '0')}:${String(k.getMinutes()).padStart(2, '0')}`;
  for (let d = 0; d < 8; d++) {
    const h = HARI_JADUAL[(hi + d) % 7];
    const s = list.filter(j => j.hari === h && (d > 0 || j.tamat > kini)).sort((a, b) => a.mula.localeCompare(b.mula))[0];
    if (s) return { slot: s, hariLagi: d, sedang: d === 0 && s.mula <= kini };
  }
  return null;
}
function htmlJadual(list, edit) {
  if (!list.length) return '<p style="color:#9097A3;margin:0">Belum ada jadual latihan.</p>';
  const hi = hariIni(), nx = slotSeterusnya(list);
  const tajukNx = nx ? (nx.sedang ? '🟢 Sedang berlangsung' : nx.hariLagi === 0 ? 'Latihan hari ini' : nx.hariLagi === 1 ? 'Latihan esok' : `Latihan seterusnya · ${nx.slot.hari}`) : '';
  return (nx ? `<div style="background:#2a2513;border:1px solid #E2B55A;border-radius:12px;padding:12px;margin-bottom:12px">
      <div style="font-size:12px;color:#E2B55A;font-weight:700">${tajukNx}</div>
      <div style="font-size:20px;font-weight:800">${jam12(nx.slot.mula)} – ${jam12(nx.slot.tamat)}</div>
      <div style="font-size:13px;color:#9097A3">${esc(nx.slot.hari)}${nx.slot.nama_cawangan ? ' · 📍 ' + esc(nx.slot.nama_cawangan) : ''}${nx.slot.lokasi ? ' · ' + esc(nx.slot.lokasi) : ''}</div></div>` : '') +
    HARI_JADUAL.filter(h => list.some(j => j.hari === h)).map(h => `<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #2C313C">
      <b style="width:74px;flex:none;font-size:13px;${h === hi ? 'color:#E2B55A' : ''}">${h}${h === hi ? ' •' : ''}</b>
      <div style="flex:1;min-width:0">${list.filter(j => j.hari === h).map(j => `<div style="display:flex;gap:8px;align-items:center;margin-bottom:4px${edit ? ';cursor:pointer' : ''}" ${edit ? `onclick="borangJadual('${esc(j.id)}')"` : ''}>
        <span style="font-weight:700;font-size:14px;white-space:nowrap">${jam12(j.mula)} – ${jam12(j.tamat)}</span>
        <span style="font-size:12px;color:#9097A3;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${[j.nama_cawangan ? '📍 ' + esc(j.nama_cawangan) : '', esc(j.lokasi || ''), esc(j.catatan || '')].filter(Boolean).join(' · ')}</span>${edit ? '<span style="margin-left:auto;color:#9097A3">✎</span>' : ''}</div>`).join('')}</div></div>`).join('');
}
