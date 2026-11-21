// Ujian paparan sebenar dalam Chromium (DATA PALSU, API Google disimulasi oleh gasmock).
// Guna: NODE_PATH=$(npm root -g) node ujian_paparan.js /laluan/ke/repo [folder-gambar]
// Menyemak: log masuk, menu, yuran, kehadiran ikut sesi, portal ibu bapa, borang online, Mod Normal/Malam, ralat JS.
const { chromium } = require('playwright'); const DIR = process.argv[2] || process.cwd(), OUT = process.argv[3] || '';
const G = require(__dirname + '/gasmock.js')(DIR + '/Code.gs'), P = G.panggil;
let l = 0, g = 0; const t = (n, ok, i) => { ok ? l++ : g++; console.log((ok ? '✅ ' : '❌ ') + n + (ok ? '' : ' → ' + JSON.stringify(i))); };
const terma = tok => P({ action: 'setuju_terma', token: tok, versi: '1.0', setuju: true });
P({ action: 'cipta_super', id: 'superadmin', nama: 'Pentadbir Contoh', katalaluan: 'Rahsia123' });
const S = P({ action: 'login', id: 'superadmin', katalaluan: 'Rahsia123' }).token; terma(S);
P({ action: 'daftar', id: 'cikgu.contoh', katalaluan: 'Rahsia123', nama: 'Cikgu Contoh', telefon: '0100000000', negeri: 'PRK', terma: true, pdpa: true, gelanggang_baru: { nama: 'Gelanggang Contoh' } });
P({ action: 'lulus_gelanggang', token: S, kod: G.baris('GELANGGANG')[0].KOD, kod3: 'CTH' }); P({ action: 'status_pengguna', token: S, id: 'cikgu.contoh', status: 'AKTIF' });
const J = P({ action: 'login', id: 'cikgu.contoh', katalaluan: 'Rahsia123' }).token; terma(J);
['ADAM BIN CONTOH', 'AISYAH BINTI CONTOH', 'HARIS BIN CONTOH'].forEach((n, i) => P({ action: 'daftar_ahli', token: J, pdpa: true, pdpa_oleh: 'Waris Contoh',
  data: { no_kp: '15010' + (i + 1) + '080001', nama: n, jantina: 'L', tarikh_lahir: '2015-01-01', bengkung: 'Putih', tel_waris: '0120000000' } }));
P({ action: 'jad_simpan', token: J, hari: 'SABTU', sesi: 'Pagi', mula: '08:00', tamat: '10:00' });
P({ action: 'jad_simpan', token: J, hari: 'SABTU', sesi: 'Malam', mula: '20:30', tamat: '22:30' });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = [];
  const baru = async tema => { const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
    p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.type() === 'prompt' ? d.accept('Latihan Khas') : d.accept());
    await p.route('**/script.google.com/**', r => { let d = {}; try { d = JSON.parse(r.request().postData() || '{}'); } catch (e) {} r.fulfill({ contentType: 'application/json', body: JSON.stringify(P(d)) }); });
    await p.addInitScript(tm => { localStorage.setItem('pwa_jur', '1'); localStorage.setItem('pwa_ib', '1'); localStorage.setItem('sp_tema', tm); }, tema); return p; };
  const gambar = async (p, n) => { if (OUT) await p.screenshot({ path: OUT + '/' + n + '.png' }); };
  let p = await baru('normal');
  await p.goto('file://' + DIR + '/index.html'); await p.waitForTimeout(500);
  t('skrin log masuk dipapar', await p.isVisible('#lId')); await gambar(p, '1-login');
  t('Mod Normal aktif + butang tukar tema', await p.evaluate(() => document.documentElement.dataset.tema === 'normal') && await p.isVisible('.tukarTema'));
  await p.fill('#lId', 'cikgu.contoh'); await p.fill('#lPw', 'Rahsia123'); await p.click('text=Log Masuk'); await p.waitForTimeout(900);
  t('halaman utama jurulatih', (await p.innerText('body')).toUpperCase().includes('GELANGGANG CONTOH')); await gambar(p, '2-utama');
  await p.click('.tukarTema'); t('tukar ke Mod Malam', await p.evaluate(() => document.documentElement.dataset.tema === 'malam'));
  await p.evaluate(() => pergi('yb')); await p.waitForTimeout(700);
  t('skrin yuran (3 ahli)', (await p.$$('#isi .item')).length >= 3); await gambar(p, '3-yuran');
  await p.evaluate(() => { S.hTarikh = '2026-11-07'; S.hSesi = null; pergi('hadir'); }); await p.waitForTimeout(900);
  const cip = await p.$$eval('#cipSesi button', x => x.map(y => y.textContent.trim()));
  t('kehadiran: sesi Sabtu dari jadual + "+ Sesi lain"', cip.length === 3 && /PAGI/.test(cip[0]) && /MALAM/.test(cip[1]), cip);
  await p.click('#senH .item >> nth=0'); await p.click('text=Simpan Kehadiran'); await p.waitForTimeout(600);
  t('kehadiran sesi disimpan', G.baris('KEHADIRAN').some(x => x.SESI === 'PAGI' && x.BIL_HADIR === '1')); await gambar(p, '4-kehadiran');
  p = await baru('malam'); await p.goto('file://' + DIR + '/ibubapa.html'); await p.waitForTimeout(400);
  await p.fill('#kp', '150101080001'); await p.fill('#tel', '0120000000'); await p.click('button.utama'); await p.waitForTimeout(800);
  if (await p.isVisible('#ppSetuju')) { await p.check('#ppSetuju'); await p.click('#ppYa'); await p.waitForTimeout(400); }
  t('portal ibu bapa: kad ahli dipapar', (await p.innerText('body')).includes('ADAM BIN CONTOH')); await gambar(p, '5-portal');
  p = await baru('normal'); await p.goto('file://' + DIR + '/daftar.html?g=PRK-CTH'); await p.waitForTimeout(700);
  t('borang online dibuka + perangkap bot tersembunyi', await p.isVisible('#kp') && (await p.$eval('#laman', e => e.getBoundingClientRect().right <= 0))); await gambar(p, '6-borang');
  t('tiada ralat JavaScript', !errs.length, errs);
  console.log('\nLULUS ' + l + ' · GAGAL ' + g); process.exitCode = g ? 1 : 0; await b.close();
})();
