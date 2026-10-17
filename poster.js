/* ====== Penjana poster gelanggang (PNG 1080 × 1920, sesuai WhatsApp Status / Telegram) ====== */
const POSTER = { W: 1080, H: 1920, emas: '#E2B55A', gelap: '#0F1115', kad: '#181B22', teks: '#E8E9EC', pudar: '#9097A3' };
function muatImej(src) { return new Promise(ok => { if (!src) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; }); }
function bulat(cx, x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
function balut(cx, teks, x, y, lebar, tinggiBaris, jajar) {
  const baris = []; teks.split('\n').forEach(p => { let b = ''; p.split(' ').forEach(k => { const c = b ? b + ' ' + k : k; if (cx.measureText(c).width > lebar && b) { baris.push(b); b = k; } else b = c; }); baris.push(b); });
  cx.textAlign = jajar || 'left'; baris.forEach((b, i) => cx.fillText(b, x, y + i * tinggiBaris)); return y + baris.length * tinggiBaris;
}
function lukisQR(cx, teks, x, y, saiz) {
  const q = qrcode(0, 'M'); q.addData(teks); q.make();
  const n = q.getModuleCount(), m = 4, s = saiz / (n + m * 2);
  cx.fillStyle = '#fff'; bulat(cx, x, y, saiz, saiz, 28); cx.fill(); cx.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) cx.fillRect(Math.floor(x + (c + m) * s), Math.floor(y + (r + m) * s), Math.ceil(s), Math.ceil(s));
}
function latar(cx) {
  const { W, H } = POSTER, g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b1e26'); g.addColorStop(1, '#0B0D10');
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  cx.fillStyle = 'rgba(226,181,90,.08)'; cx.beginPath(); cx.arc(W + 60, 120, 420, 0, 7); cx.fill(); cx.beginPath(); cx.arc(-120, H - 200, 380, 0, 7); cx.fill();
  cx.fillStyle = POSTER.emas; cx.fillRect(0, 0, W, 14); cx.fillRect(0, H - 14, W, 14);
}
async function kepala(cx, info, tajuk, subtajuk) {
  const { W } = POSTER, [lg, lp] = await Promise.all([muatImej(info.logo || 'logo.png'), muatImej('logo.png')]);
  const logo = (i, x, y, r) => { cx.save(); cx.beginPath(); cx.arc(x, y, r + 8, 0, 7); cx.fillStyle = POSTER.emas; cx.fill(); cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fillStyle = '#fff'; cx.fill(); cx.clip(); if (i) cx.drawImage(i, x - r, y - r, r * 2, r * 2); cx.restore(); };
  if (info.logo) { logo(lg, W / 2 - 115, 200, 100); logo(lp, W / 2 + 115, 200, 100); } else logo(lp, W / 2, 200, 115);
  cx.fillStyle = POSTER.emas; cx.font = '900 80px system-ui,Arial'; cx.textAlign = 'center'; cx.fillText(tajuk, W / 2, 415);
  cx.fillStyle = POSTER.teks; cx.font = '800 50px system-ui,Arial'; let y = balut(cx, info.nama.toUpperCase(), W / 2, 500, 940, 60, 'center');
  cx.fillStyle = POSTER.pudar; cx.font = '500 32px system-ui,Arial'; cx.fillText(subtajuk || `Sri Gayong Panglima Ulung · ${info.negeri}`, W / 2, y + 6);
  return y + 50;
}
function kaki(cx, teks) {
  const { W, H } = POSTER; cx.fillStyle = POSTER.pudar; cx.font = '500 28px system-ui,Arial'; cx.textAlign = 'center';
  cx.fillText(teks, W / 2, H - 70); cx.fillStyle = POSTER.emas; cx.font = '700 30px system-ui,Arial'; cx.fillText('SilatApp · Sri Gayong Panglima Ulung', W / 2, H - 112);
}
function kotak(cx, x, y, w, h, tajuk) {
  cx.fillStyle = POSTER.kad; bulat(cx, x, y, w, h, 32); cx.fill(); cx.strokeStyle = '#2C313C'; cx.lineWidth = 3; cx.stroke();
  if (tajuk) { cx.fillStyle = POSTER.emas; bulat(cx, x, y, w, 86, 32); cx.fill(); cx.fillRect(x, y + 50, w, 36); cx.fillStyle = '#1a1405'; cx.font = '800 38px system-ui,Arial'; cx.textAlign = 'left'; cx.fillText(tajuk, x + 36, y + 57); }
}
const POSTER_JENIS = {
  daftar: { nama: 'Scan Untuk Daftar', async lukis(cx, i) {
    const { W } = POSTER; let y = await kepala(cx, i, 'SCAN UNTUK DAFTAR');
    lukisQR(cx, i.linkDaftar, W / 2 - 330, y + 10, 660);
    cx.fillStyle = POSTER.teks; cx.font = '600 38px system-ui,Arial';
    y = balut(cx, 'Untuk pendaftaran pesilat baharu, sila imbas QR di atas dan lengkapkan borang.', W / 2, y + 760, 900, 52, 'center');
    cx.fillStyle = POSTER.pudar; cx.font = '500 32px system-ui,Arial';
    y = balut(cx, 'Permohonan akan disemak & diluluskan oleh jurulatih gelanggang. Bawah 18 tahun: perlu kebenaran ibu bapa / penjaga.', W / 2, y + 20, 900, 44, 'center');
    if (i.jadual.length) { cx.fillStyle = POSTER.emas; cx.font = '700 34px system-ui,Arial'; cx.fillText('📅 ' + i.jadual.slice(0, 3).map(j => `${j.hari.slice(0, 3)} ${jam12(j.mula)}`).join('  ·  '), W / 2, y + 50); }
    kaki(cx, i.linkDaftar.replace(/^https?:\/\//, ''));
  } },
  portal: { nama: 'Tutorial Portal Ibu Bapa', async lukis(cx, i) {
    const { W } = POSTER; let y = await kepala(cx, i, 'PORTAL IBU BAPA');
    cx.fillStyle = POSTER.teks; cx.font = '800 36px system-ui,Arial'; cx.textAlign = 'left'; cx.fillText('Ibu bapa dan pelajar yang dihormati,', 70, y + 10);
    cx.fillStyle = POSTER.pudar; cx.font = '500 30px system-ui,Arial';
    y = balut(cx, 'Semak perkembangan anak melalui Portal Ibu Bapa — percuma, tanpa daftar akaun.', 70, y + 56, 940, 40);
    kotak(cx, 50, y + 10, 980, 300, '🔐  MAKLUMAT LOG MASUK');
    cx.textAlign = 'left'; cx.fillStyle = POSTER.emas; cx.font = '800 36px system-ui,Arial'; cx.fillText('No. KP / MyKid:', 90, y + 165); cx.fillText('No. Telefon:', 90, y + 255);
    cx.fillStyle = POSTER.teks; cx.font = '600 34px system-ui,Arial'; cx.fillText('No. KP pelajar', 400, y + 165); cx.fillText('No. telefon waris', 400, y + 255);
    cx.fillStyle = POSTER.pudar; cx.font = '500 26px system-ui,Arial'; cx.fillText('(tanpa tanda -)', 400, y + 200); cx.fillText('(seperti didaftarkan di gelanggang)', 400, y + 290);
    y += 336;
    kotak(cx, 50, y, 980, 380, '📱  CIRI-CIRI PORTAL');
    [['✅', 'Semak kehadiran latihan anak'], ['💳', 'Bayar yuran melalui QR & hantar resit'], ['📅', 'Jadual latihan gelanggang'], ['⚖️', 'Kelas berat, kategori usia & BMI']].forEach((f, k) => {
      cx.font = '40px system-ui,Arial'; cx.textAlign = 'left'; cx.fillText(f[0], 90, y + 145 + k * 66); cx.fillStyle = POSTER.teks; cx.font = '600 34px system-ui,Arial'; cx.fillText(f[1], 160, y + 145 + k * 66); });
    y += 410;
    lukisQR(cx, i.linkPortal, 60, y, 270);
    cx.textAlign = 'left'; cx.fillStyle = POSTER.emas; cx.font = '800 38px system-ui,Arial'; cx.fillText('Imbas & Pasang', 370, y + 50);
    cx.fillStyle = POSTER.teks; cx.font = '500 28px system-ui,Arial';
    balut(cx, '1. Imbas QR / buka pautan\n2. Tekan "Pasang" (Android) atau Kongsi → Add to Home Screen (iPhone)\n3. Log masuk dengan No. KP & telefon', 370, y + 100, 650, 38);
    kaki(cx, i.linkPortal.replace(/^https?:\/\//, ''));
  } },
  jadual: { nama: 'Jadual Latihan', async lukis(cx, i) {
    const { W } = POSTER; let y = await kepala(cx, i, 'JADUAL LATIHAN');
    if (!i.jadual.length) { cx.fillStyle = POSTER.pudar; cx.font = '500 38px system-ui,Arial'; cx.fillText('Belum ada jadual latihan.', W / 2, y + 120); }
    const hari = HARI_JADUAL.filter(h => i.jadual.some(j => j.hari === h));
    hari.forEach(h => {
      const sl = i.jadual.filter(j => j.hari === h), tinggi = 110 + sl.length * 92;
      if (y + tinggi > POSTER.H - 470) return;
      kotak(cx, 60, y + 10, 960, tinggi); cx.fillStyle = POSTER.emas; cx.font = '900 44px system-ui,Arial'; cx.textAlign = 'left'; cx.fillText(h, 100, y + 75);
      sl.forEach((j, k) => { const yy = y + 150 + k * 92; cx.fillStyle = POSTER.teks; cx.font = '800 42px system-ui,Arial'; cx.fillText(`${jam12(j.mula)} – ${jam12(j.tamat)}`, 100, yy);
        cx.fillStyle = POSTER.pudar; cx.font = '500 28px system-ui,Arial'; cx.fillText([j.nama_cawangan, j.lokasi, j.catatan].filter(Boolean).join(' · ').slice(0, 60), 100, yy + 38); });
      y += tinggi + 24;
    });
    lukisQR(cx, i.linkDaftar, W / 2 - 120, POSTER.H - 440, 240);
    cx.fillStyle = POSTER.pudar; cx.font = '500 26px system-ui,Arial'; cx.textAlign = 'center'; cx.fillText('Imbas untuk daftar sebagai pesilat', W / 2, POSTER.H - 160);
    kaki(cx, '');
  } }
};
async function janaPoster(jenis, info) {
  const cv = document.createElement('canvas'); cv.width = POSTER.W; cv.height = POSTER.H;
  const cx = cv.getContext('2d'); latar(cx); await POSTER_JENIS[jenis].lukis(cx, info); return cv;
}
