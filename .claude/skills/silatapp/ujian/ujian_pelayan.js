// Ujian pelayan (Code.gs) dengan DATA PALSU. Guna: node ujian_pelayan.js /laluan/ke/repo
// Berfungsi pada kedua-dua cawangan (dengan atau tanpa modul PDPA/Terma).
const DIR = process.argv[2] || process.cwd(), G = require(__dirname + '/gasmock.js')(DIR + '/Code.gs'), P = G.panggil;
let l = 0, g = 0; const t = (n, ok, i) => { ok ? l++ : g++; console.log((ok ? '✅ ' : '❌ ') + n + (ok ? '' : ' → ' + JSON.stringify(i))); };
const terma = tok => P({ action: 'setuju_terma', token: tok, versi: '1.0', setuju: true });
const pg = id => G.baris('PENGGUNA').find(x => x.ID === id);
// --- Akaun & peranan ---
t('ping', P({ action: 'ping' }).ok);
P({ action: 'cipta_super', id: 'superadmin', nama: 'pentadbir contoh', katalaluan: 'Rahsia123' });
t('Super Admin kedua ditolak', !P({ action: 'cipta_super', id: 'super2', nama: 'X', katalaluan: 'Rahsia123' }).ok);
const S = P({ action: 'login', id: 'superadmin', katalaluan: 'Rahsia123' }).token; terma(S);
t('log masuk Super Admin', !!S);
P({ action: 'daftar', id: 'cikgu.contoh', katalaluan: 'Rahsia123', nama: 'cikgu contoh', telefon: '0100000000', negeri: 'PRK', terma: true, pdpa: true, gelanggang_baru: { nama: 'gelanggang contoh' } });
const KOD0 = G.baris('GELANGGANG')[0].KOD;
P({ action: 'lulus_gelanggang', token: S, kod: KOD0, kod3: 'CTH' }); P({ action: 'status_pengguna', token: S, id: 'cikgu.contoh', status: 'AKTIF' });
const J = P({ action: 'login', id: 'cikgu.contoh', katalaluan: 'Rahsia123' }).token; terma(J);
t('jurulatih diluluskan & log masuk', !!J);
t('kata laluan disimpan format v2 (SHA-256 berulang)', String(pg('cikgu.contoh').HASH).startsWith('v2$'));
t('salah kata laluan ditolak', !P({ action: 'login', id: 'cikgu.contoh', katalaluan: 'Salah1234' }).ok);
// --- Ketetapan huruf besar ---
t('nama disimpan HURUF BESAR, ID kekal kecil', pg('cikgu.contoh').NAMA === 'CIKGU CONTOH' && pg('cikgu.contoh').ID === 'cikgu.contoh');
t('nama gelanggang HURUF BESAR', G.baris('GELANGGANG')[0].NAMA === 'GELANGGANG CONTOH');
// --- Ahli & portal ibu bapa ---
['adam bin contoh', 'aisyah binti contoh'].forEach((n, i) => P({ action: 'daftar_ahli', token: J, pdpa: true, pdpa_oleh: 'waris contoh',
  data: { no_kp: '15010' + (i + 1) + '080001', nama: n, jantina: i ? 'P' : 'L', tarikh_lahir: '2015-01-01', bengkung: 'Putih', tel_waris: i ? '0123456789 / 0198887777' : '0120000000' } }));
const ahli = P({ action: 'senarai_ahli', token: J }).ahli;
t('2 ahli didaftar (nama huruf besar)', ahli.length === 2 && ahli[0].nama === 'ADAM BIN CONTOH', ahli);
t('portal: KP + tel betul', P({ action: 'ibubapa', no_kp: '150101080001', telefon: '0120000000' }).ok);
t('portal: tel kedua dalam medan 2 nombor', P({ action: 'ibubapa', no_kp: '150102080001', telefon: '0198887777' }).ok);
t('portal: tel salah ditolak', !P({ action: 'ibubapa', no_kp: '150101080001', telefon: '0171111111' }).ok);
// --- Sesi latihan & kehadiran ---
t('jadual: 1 borang banyak hari', P({ action: 'jad_simpan', token: J, hari: ['RABU', 'SABTU'], sesi: 'pagi', mula: '08:00', tamat: '10:00' }).ok && G.baris('JADUAL_LATIHAN').length === 2);
P({ action: 'jad_simpan', token: J, hari: 'SABTU', sesi: 'malam', mula: '20:30', tamat: '22:30' });
t('jadual: masa bertindih ditolak', !P({ action: 'jad_simpan', token: J, hari: 'SABTU', sesi: 'x', mula: '09:00', tamat: '11:00' }).ok);
const kp = ahli.map(a => a.no_kp);
P({ action: 'hadir_simpan', token: J, tarikh: '2026-11-07', sesi: 'pagi', hadir: kp });
P({ action: 'hadir_simpan', token: J, tarikh: '2026-11-07', sesi: 'Malam', hadir: kp.slice(0, 1) });
const h = P({ action: 'hadir_get', token: J, tarikh: '2026-11-07', sesi: 'MALAM' });
t('kehadiran ikut sesi (2 sesi sehari)', h.hadir.length === 1 && h.sesiDirekod.length === 2, h);
t('laporan kira setiap sesi', P({ action: 'hadir_laporan', token: J, tahun: 2026, bulan: 11 }).bil[kp[0]] === 2);
// --- Yuran & kewangan ---
t('yuran bulanan direkod', P({ action: 'yb_simpan', token: J, no_kp: kp[0], bulan: 11, tahun: 2026, jumlah: 30, kaedah: 'TUNAI' }).ok);
t('kewangan direkod (kategori huruf besar)', P({ action: 'kew_simpan', token: J, tarikh: '2026-11-01', jenis: 'MASUK', kategori: 'derma', jumlah: 50 }).ok && G.baris('KEWANGAN')[0].KATEGORI === 'DERMA');
// --- Keselamatan ---
const A2 = P({ action: 'login', id: 'cikgu.contoh', katalaluan: 'Rahsia123' }).token;
const r = P({ action: 'tukar_katalaluan', token: J, lama: 'Rahsia123', baru: 'Baharu1234' });
t('tukar kata laluan → peranti lain dilog keluar', r.ok && P({ action: 'saya', token: A2 }).logout === true, r);
const rs = P({ action: 'reset_katalaluan', token: S, id: 'cikgu.contoh' });
const T = P({ action: 'login', id: 'cikgu.contoh', katalaluan: rs.sementara }).token;
t('kata laluan sementara: fungsi lain ditolak di pelayan', P({ action: 'senarai_ahli', token: T }).wajib_tukar === true);
const get = o => JSON.parse(G.ctx.doGet({ parameter: { p: JSON.stringify(o) } }).t);
t('GET: log masuk melalui URL ditolak', /POST/.test(get({ action: 'login', id: 'x', katalaluan: 'y' }).msg || ''));
t('GET: ping masih berfungsi', get({ action: 'ping' }).ok);
t('borang online: bot (medan "laman") diabaikan', (() => { const n = G.baris('PERMOHONAN').length; const x = P({ action: 'borang_hantar', g: G.baris('GELANGGANG')[0].KOD, data: { laman: 'spam', no_kp: '150103080001', nama: 'bot' } }); return x.ok && G.baris('PERMOHONAN').length === n; })());
console.log('\nLULUS ' + l + ' · GAGAL ' + g); process.exitCode = g ? 1 : 0;
