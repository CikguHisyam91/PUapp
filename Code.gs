/****************************************************************
 * SILATAPP PUSAT — Seni Silat Gayong (Sri Gayong Panglima Ulung)
 * Fail: Code.gs  (salin SEMUA kandungan ini ke Apps Script)
 *
 * LANGKAH PERTAMA SAHAJA:
 *   1. Isi SETUP_ID dan SETUP_KATALALUAN di bawah.
 *   2. Pilih fungsi "setup" → klik Run (Jalankan).
 *   3. Selepas berjaya, PADAM kata laluan di bawah (tukar jadi '').
 ****************************************************************/
var SETUP_ID = '';            // cth. 'superadmin'
var SETUP_NAMA = '';          // cth. 'Cikgu Hisyam'
var SETUP_TELEFON = '';       // cth. '0123456789'
var SETUP_KATALALUAN = '';    // cth. 'KataLaluanKuat123'

/* Untuk import data sistem lama (Peringkat 4) */
var IMPORT_ID_SHEET_LAMA = '1YfCDLeWkZR7VV0YWTHwPodXIk8I7H80pJrjefgU09Pw';  // Sheet Gelanggang Seri Mutiara
var IMPORT_KOD_GELANGGANG = 'PRK-SMT';     // kod gelanggang Seri Mutiara dalam Pusat
var SEGERAK_MINIT = 5;                     // segerak auto setiap 5 minit

/* ======================= TETAPAN ======================= */
var NEGERI = [
  ['JHR','Johor'],['KDH','Kedah'],['KTN','Kelantan'],['MLK','Melaka'],
  ['NSN','Negeri Sembilan'],['PHG','Pahang'],['PRK','Perak'],['PLS','Perlis'],
  ['PNG','Pulau Pinang'],['SBH','Sabah'],['SWK','Sarawak'],['SGR','Selangor'],
  ['TRG','Terengganu'],['KUL','W.P. Kuala Lumpur'],['LBN','W.P. Labuan'],['PJY','W.P. Putrajaya']
];
var SESI_HARI = 7;
var MAX_GAGAL = 5;
var KUNCI_MINIT = 15;
var HARI_AKTIF = 60;

var JADUAL = {
  NEGERI: ['KOD','NAMA'],
  GELANGGANG: ['KOD','NAMA','NEGERI','ALAMAT','KETUA_ID','TARIKH_DAFTAR','STATUS','AKTIVITI_TERAKHIR','LOGO','QR_BAYAR','INFO_BAYAR','QR_DIKEMASKINI'],
  BAYARAN_NOTIS: ['ID','KOD_GELANGGANG','NO_KP','TARIKH_HANTAR','JENIS','TAHUN','BULAN','JUMLAH','RESIT','CATATAN','STATUS','DIPROSES_OLEH','TARIKH_PROSES'],
  PENGGUNA: ['ID','HASH','SALT','NAMA','TELEFON','PERANAN','NEGERI','KOD_GELANGGANG','KETUA','STATUS','TARIKH_DAFTAR','GAGAL','KUNCI_HINGGA','WAJIB_TUKAR'],
  SESI: ['TOKEN','ID','LUPUT'],
  AHLI: ['NO_AHLI','NO_KP','NAMA','JANTINA','TARIKH_LAHIR','BENGKUNG','GELANGGANG_UTAMA','STATUS','TARIKH_DAFTAR','TEL_WARIS','ID_LAMA'],
  KEAHLIAN_GELANGGANG: ['NO_KP','KOD_GELANGGANG','JENIS','STATUS','TARIKH_MULA','TARIKH_TAMAT','CAWANGAN'],
  YURAN_TAHUNAN: ['NO_KP','KOD_GELANGGANG','TAHUN','JUMLAH','TARIKH_BAYAR','DIREKOD_OLEH'],
  LOG_AUDIT: ['MASA','ID','TINDAKAN','BUTIRAN'],
  // Data dalaman gelanggang (HANYA jurulatih gelanggang itu nampak)
  KEHADIRAN: ['TARIKH','KOD_GELANGGANG','HADIR','BIL_HADIR','CATATAN','DIREKOD_OLEH','CAWANGAN'],
  CAWANGAN: ['ID','KOD_GELANGGANG','NAMA','ALAMAT','STATUS','TARIKH_DAFTAR'],
  PERMOHONAN: ['ID','KOD_GELANGGANG','CAWANGAN','TARIKH_MOHON','NO_KP','NAMA','JANTINA','TARIKH_LAHIR','ALAMAT','TEL_PESILAT','SEKOLAH_KERJA',
    'NAMA_WARIS','HUBUNGAN_WARIS','NO_KP_WARIS','TEL_WARIS','EMEL_WARIS','KESIHATAN','KEBENARAN_WARIS','AKUR_ADAT','PDPA','STATUS','SEBAB_TOLAK','DIPROSES_OLEH','TARIKH_PROSES','NO_AHLI'],
  JADUAL_LATIHAN: ['ID','KOD_GELANGGANG','CAWANGAN','HARI','MULA','TAMAT','LOKASI','CATATAN'],
  YURAN_BULANAN: ['NO_KP','KOD_GELANGGANG','TAHUN','BULAN','JUMLAH','TARIKH_BAYAR','KAEDAH','DIREKOD_OLEH'],
  KEWANGAN: ['ID','KOD_GELANGGANG','TARIKH','JENIS','KATEGORI','KETERANGAN','JUMLAH','DIREKOD_OLEH'],
  PENGECUALIAN: ['ID','KOD_GELANGGANG','JENIS','NO_KP','MULA','TAMAT','SEBAB','DIREKOD_OLEH'],
  FIZIKAL: ['ID','NO_KP','KOD_GELANGGANG','TARIKH','BERAT','TINGGI','BMI','TEKAN_TUBI','BANGKIT_TUBI','LARI','CATATAN','DIREKOD_OLEH']
};

/* ======================= SETUP ======================= */
function setup() {
  binaSheet_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(JADUAL).forEach(function (nama) {
    var sh = ss.getSheetByName(nama) || ss.insertSheet(nama);
    sh.getRange(1, 1, sh.getMaxRows(), JADUAL[nama].length).setNumberFormat('@');
    sh.getRange(1, 1, 1, JADUAL[nama].length).setValues([JADUAL[nama]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  var neg = ss.getSheetByName('NEGERI');
  if (neg.getLastRow() < 2) neg.getRange(2, 1, NEGERI.length, 2).setValues(NEGERI);
  var s1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Helaian1');
  if (s1 && ss.getSheets().length > 1 && s1.getLastRow() === 0) ss.deleteSheet(s1);

  if (SETUP_ID && SETUP_KATALALUAN) {
    var id = String(SETUP_ID).trim().toLowerCase();
    if (cariSatu_('PENGGUNA', 'ID', id)) {
      Logger.log('ID ' + id + ' sudah wujud. Tiada akaun baharu dicipta.');
    } else {
      var salt = Utilities.getUuid();
      tambah_('PENGGUNA', { ID: id, HASH: hash_(SETUP_KATALALUAN, salt), SALT: salt, NAMA: SETUP_NAMA || id,
        TELEFON: SETUP_TELEFON, PERANAN: 'SUPER_ADMIN', NEGERI: '', KOD_GELANGGANG: '', KETUA: 'TIDAK',
        STATUS: 'AKTIF', TARIKH_DAFTAR: hariIni_(), GAGAL: '0', KUNCI_HINGGA: '' });
      log_(id, 'SETUP', 'Super Admin dicipta');
      Logger.log('BERJAYA: Super Admin "' + id + '" dicipta. Sila padam kata laluan dalam kod.');
    }
  } else {
    Logger.log('Sheet siap. (Isi SETUP_ID & SETUP_KATALALUAN untuk cipta Super Admin.)');
  }
  if (!PropertiesService.getScriptProperties().getProperty('IMPORT_KEY')) {
    PropertiesService.getScriptProperties().setProperty('IMPORT_KEY', Utilities.getUuid());
  }
}

function binaSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(JADUAL).forEach(function (nama) {
    var ada = ss.getSheetByName(nama);
    if (ada) { // tambah lajur baharu pada sheet lama jika perlu
      if (ada.getLastColumn() < JADUAL[nama].length) {
        ada.getRange(1, 1, ada.getMaxRows(), JADUAL[nama].length).setNumberFormat('@');
        ada.getRange(1, 1, 1, JADUAL[nama].length).setValues([JADUAL[nama]]).setFontWeight('bold');
      }
      return;
    }
    var sh = ss.insertSheet(nama);
    sh.getRange(1, 1, sh.getMaxRows(), JADUAL[nama].length).setNumberFormat('@');
    sh.getRange(1, 1, 1, JADUAL[nama].length).setValues([JADUAL[nama]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  var neg = ss.getSheetByName('NEGERI');
  if (neg.getLastRow() < 2) neg.getRange(2, 1, NEGERI.length, 2).setNumberFormat('@').setValues(NEGERI);
}
function adaSuper_() {
  return baca_('PENGGUNA').some(function (x) { return x.PERANAN === 'SUPER_ADMIN'; });
}

/* ======================= PINTU API ======================= */
function doGet(e) {
  var p = {};
  try { if (e && e.parameter && e.parameter.p) p = JSON.parse(e.parameter.p); } catch (x) {}
  if (!p.action) p.action = 'ping';
  return jawab_(urus_(p));
}
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { return jawab_({ ok: false, msg: 'Data tidak sah' }); }
  return jawab_(urus_(p));
}
function jawab_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

var AWAM = { ibubapa_bayar: 1, borang_info: 1, borang_hantar: 1, ibubapa: 1, ping: 1, negeri: 1, daftar: 1, login: 1, status_awal: 1, cipta_super: 1 };
var TULIS = { ubah_admin: 1, ibubapa_bayar: 1, qr_simpan: 1, notis_sahkan: 1, notis_tolak: 1, borang_hantar: 1, mohon_lulus: 1, mohon_tolak: 1, tukar_kod: 1, jad_simpan: 1, jad_padam: 1, reset_katalaluan: 1, caw_simpan: 1, caw_padam: 1, caw_tag: 1, logo_simpan: 1, kec_simpan: 1, kec_padam: 1, hadir_simpan: 1, yb_simpan: 1, yb_padam: 1, kew_simpan: 1, kew_padam: 1, fiz_simpan: 1, fiz_padam: 1, cipta_super: 1, daftar: 1, login: 1, logout: 1, tukar_katalaluan: 1, kemaskini_profil: 1, lulus_gelanggang: 1, status_gelanggang: 1,
  status_pengguna: 1, set_ketua: 1, lantik_admin: 1, daftar_ahli: 1, kemaskini_ahli: 1, status_ahli: 1,
  rekod_yuran: 1, padam_yuran: 1, mohon_gelanggang: 1 };

function urus_(p) {
  var lock = null;
  try {
    var a = p.action;
    var VERSI_SKEMA = '7';
    if (PropertiesService.getScriptProperties().getProperty('SKEMA') !== VERSI_SKEMA || !sh_('PENGGUNA')) {
      binaSheet_(); PropertiesService.getScriptProperties().setProperty('SKEMA', VERSI_SKEMA);
    }
    if (TULIS[a]) {
      lock = LockService.getScriptLock();
      if (!lock.tryLock(25000)) return { ok: false, msg: 'Sistem sibuk. Cuba lagi sebentar.' };
    }
    if (AWAM[a]) return AWAM_FN[a](p);
    var u = sahkanToken_(p.token);
    if (!u) return { ok: false, msg: 'Sesi tamat. Sila log masuk semula.', logout: true };
    var fn = API[a];
    if (!fn) return { ok: false, msg: 'Tindakan tidak dikenali: ' + a };
    var r = fn(u, p);
    if (TULIS[a]) naikVersi_();
    return r;
  } catch (err) {
    return { ok: false, msg: 'Ralat: ' + (err && err.message ? err.message : err) };
  } finally {
    if (lock) { SpreadsheetApp.flush(); lock.releaseLock(); }
  }
}

/* ======================= UTILITI DATA ======================= */
var _tbl = {};
function sh_(n) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(n); }
function baca_(n) {
  if (_tbl[n]) return _tbl[n];
  var sh = sh_(n), h = JADUAL[n], last = sh.getLastRow(), rows = [];
  if (last >= 2) {
    var v = sh.getRange(2, 1, last - 1, h.length).getDisplayValues();
    for (var i = 0; i < v.length; i++) {
      var o = { _r: i + 2 };
      for (var j = 0; j < h.length; j++) o[h[j]] = String(v[i][j]).trim();
      rows.push(o);
    }
  }
  _tbl[n] = rows;
  return rows;
}
function tambah_(n, o) {
  var h = JADUAL[n], sh = sh_(n);
  var baris = h.map(function (k) { return o[k] == null ? '' : String(o[k]); });
  var r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, h.length).setNumberFormat('@').setValues([baris]);
  delete _tbl[n];
  return r;
}
function kemaskini_(n, r, o) {
  var h = JADUAL[n], sh = sh_(n);
  Object.keys(o).forEach(function (k) {
    var c = h.indexOf(k);
    if (c >= 0) sh.getRange(r, c + 1).setNumberFormat('@').setValue(o[k] == null ? '' : String(o[k]));
  });
  delete _tbl[n];
}
function cariSatu_(n, k, v) {
  var rs = baca_(n);
  for (var i = 0; i < rs.length; i++) if (rs[i][k] === v) return rs[i];
  return null;
}
function hariIni_() { return Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd'); }
function masa_() { return Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm:ss'); }
function hash_(pw, salt) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + pw, Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}
function log_(id, t, b) { tambah_('LOG_AUDIT', { MASA: masa_(), ID: id, TINDAKAN: t, BUTIRAN: b || '' }); }
function naikVersi_() { CacheService.getScriptCache().put('versi', Utilities.getUuid(), 21600); }
function versi_() {
  var c = CacheService.getScriptCache(), v = c.get('versi');
  if (!v) { v = Utilities.getUuid(); c.put('versi', v, 21600); }
  return v;
}
function bersihKP_(kp) {
  var d = String(kp || '').replace(/\D/g, '');
  if (d.length === 11 && !/-/.test(String(kp))) d = '0' + d; // sifar depan hilang dari sheet lama
  if (d.length === 12) return d.slice(0, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8);
  return String(kp || '').trim().toUpperCase();
}
function topengKP_(kp) {
  var s = String(kp || '');
  return s.length > 4 ? s.slice(0, s.length - 4) + '****' : '****';
}
function nomborHari_(t) { var d = new Date(t + 'T00:00:00'); return isNaN(d) ? 0 : d.getTime(); }

/* ======================= SESI & AKSES ======================= */
function sahkanToken_(token) {
  if (!token) return null;
  var c = CacheService.getScriptCache(), id = c.get('t_' + token);
  if (!id) {
    var s = cariSatu_('SESI', 'TOKEN', token);
    if (!s || Number(s.LUPUT) < Date.now()) return null;
    id = s.ID;
    c.put('t_' + token, id, 600);
  }
  var u = cariSatu_('PENGGUNA', 'ID', id);
  if (!u || u.STATUS !== 'AKTIF') return null;
  if (u.PERANAN === 'JURULATIH') {
    var g = cariSatu_('GELANGGANG', 'KOD', u.KOD_GELANGGANG);
    if (!g || g.STATUS === 'DISEKAT') return null;
  }
  return u;
}
function bolehGel_(u, g) {
  if (!g) return false;
  if (u.PERANAN === 'SUPER_ADMIN') return true;
  if (u.PERANAN === 'ADMIN_NEGERI') return g.NEGERI === u.NEGERI;
  return g.KOD === u.KOD_GELANGGANG && g.STATUS !== 'DISEKAT';
}
function wajib_(u, peranan) {
  if (peranan.indexOf(u.PERANAN) < 0) throw new Error('Anda tiada kebenaran untuk tindakan ini.');
}
function catatAktiviti_(kodGel) {
  var g = cariSatu_('GELANGGANG', 'KOD', kodGel);
  if (g && g.AKTIVITI_TERAKHIR !== hariIni_()) kemaskini_('GELANGGANG', g._r, { AKTIVITI_TERAKHIR: hariIni_() });
}
function namaNegeri_(k) { for (var i = 0; i < NEGERI.length; i++) if (NEGERI[i][0] === k) return NEGERI[i][1]; return k; }

/* ======================= TINDAKAN AWAM ======================= */
var AWAM_FN = {
  ping: function () { return { ok: true, msg: 'SilatApp Pusat berfungsi', masa: masa_() }; },

  // Kali pertama sahaja: cipta Super Admin dari laman web jika belum ada
  status_awal: function () { return { ok: true, perluSuper: !adaSuper_() }; },
  cipta_super: function (p) {
    if (adaSuper_()) return { ok: false, msg: 'Super Admin sudah wujud. Sila log masuk.' };
    var id = String(p.id || '').trim().toLowerCase();
    if (!/^[a-z0-9._]{4,30}$/.test(id)) return { ok: false, msg: 'ID 4–30 aksara (huruf kecil / nombor sahaja, tanpa jarak).' };
    if (String(p.katalaluan || '').length < 8) return { ok: false, msg: 'Kata laluan sekurang-kurangnya 8 aksara.' };
    if (!p.nama) return { ok: false, msg: 'Nama wajib.' };
    if (cariSatu_('PENGGUNA', 'ID', id)) return { ok: false, msg: 'ID sudah digunakan.' };
    var salt = Utilities.getUuid();
    tambah_('PENGGUNA', { ID: id, HASH: hash_(p.katalaluan, salt), SALT: salt, NAMA: String(p.nama).trim(),
      TELEFON: String(p.telefon || '').trim(), PERANAN: 'SUPER_ADMIN', NEGERI: '', KOD_GELANGGANG: '', KETUA: 'TIDAK',
      STATUS: 'AKTIF', TARIKH_DAFTAR: hariIni_(), GAGAL: '0', KUNCI_HINGGA: '' });
    log_(id, 'CIPTA_SUPER', 'Dari laman web');
    return { ok: true, msg: 'Akaun Super Admin dicipta! Sila log masuk.' };
  },

  negeri: function () {
    var gel = baca_('GELANGGANG').filter(function (g) { return g.STATUS === 'AKTIF'; })
      .map(function (g) { return { kod: g.KOD, nama: g.NAMA, negeri: g.NEGERI }; });
    return { ok: true, negeri: NEGERI, gelanggang: gel };
  },

  daftar: function (p) {
    var id = String(p.id || '').trim().toLowerCase();
    if (!/^[a-z0-9._]{4,30}$/.test(id)) return { ok: false, msg: 'ID pengguna 4–30 aksara (huruf kecil, nombor, titik, garis bawah).' };
    if (String(p.katalaluan || '').length < 8) return { ok: false, msg: 'Kata laluan sekurang-kurangnya 8 aksara.' };
    if (!p.nama || !p.telefon) return { ok: false, msg: 'Nama dan no. telefon wajib.' };
    if (!p.pdpa) return { ok: false, msg: 'Sila bersetuju dengan notis PDPA.' };
    if (!NEGERI.some(function (n) { return n[0] === p.negeri; })) return { ok: false, msg: 'Sila pilih negeri.' };
    if (cariSatu_('PENGGUNA', 'ID', id)) return { ok: false, msg: 'ID pengguna sudah digunakan.' };

    var kodGel = '', ketua = 'TIDAK';
    if (p.gelanggang_baru) {
      var gb = p.gelanggang_baru;
      if (!gb.nama) return { ok: false, msg: 'Nama gelanggang baharu wajib.' };
      kodGel = 'BARU-' + Utilities.getUuid().slice(0, 6).toUpperCase();
      tambah_('GELANGGANG', { KOD: kodGel, NAMA: String(gb.nama).trim(), NEGERI: p.negeri, ALAMAT: gb.alamat || '',
        KETUA_ID: id, TARIKH_DAFTAR: hariIni_(), STATUS: 'MENUNGGU', AKTIVITI_TERAKHIR: '' });
      ketua = 'YA';
    } else {
      var g = cariSatu_('GELANGGANG', 'KOD', p.kod_gelanggang);
      if (!g || g.STATUS !== 'AKTIF' || g.NEGERI !== p.negeri) return { ok: false, msg: 'Sila pilih gelanggang yang sah.' };
      kodGel = g.KOD;
    }
    var salt = Utilities.getUuid();
    tambah_('PENGGUNA', { ID: id, HASH: hash_(p.katalaluan, salt), SALT: salt, NAMA: String(p.nama).trim(),
      TELEFON: String(p.telefon).trim(), PERANAN: 'JURULATIH', NEGERI: p.negeri, KOD_GELANGGANG: kodGel,
      KETUA: ketua, STATUS: 'MENUNGGU', TARIKH_DAFTAR: hariIni_(), GAGAL: '0', KUNCI_HINGGA: '' });
    log_(id, 'DAFTAR', 'Jurulatih daftar: ' + kodGel);
    return { ok: true, msg: 'Pendaftaran diterima. Tunggu kelulusan Admin Negeri ' + namaNegeri_(p.negeri) + '.' };
  },

  login: function (p) {
    var id = String(p.id || '').trim().toLowerCase();
    var u = cariSatu_('PENGGUNA', 'ID', id);
    if (!u) return { ok: false, msg: 'ID atau kata laluan salah.' };
    if (u.KUNCI_HINGGA && Number(u.KUNCI_HINGGA) > Date.now()) {
      var m = Math.ceil((Number(u.KUNCI_HINGGA) - Date.now()) / 60000);
      return { ok: false, msg: 'Akaun dikunci. Cuba lagi dalam ' + m + ' minit.' };
    }
    if (hash_(p.katalaluan || '', u.SALT) !== u.HASH) {
      var gagal = Number(u.GAGAL || 0) + 1, upd = { GAGAL: String(gagal) };
      if (gagal >= MAX_GAGAL) { upd.GAGAL = '0'; upd.KUNCI_HINGGA = String(Date.now() + KUNCI_MINIT * 60000); }
      kemaskini_('PENGGUNA', u._r, upd);
      return { ok: false, msg: gagal >= MAX_GAGAL ? 'Terlalu banyak cubaan. Akaun dikunci ' + KUNCI_MINIT + ' minit.'
        : 'ID atau kata laluan salah. (' + (MAX_GAGAL - gagal) + ' cubaan lagi)' };
    }
    if (u.STATUS === 'MENUNGGU') return { ok: false, msg: 'Akaun anda masih menunggu kelulusan Admin Negeri.' };
    if (u.STATUS !== 'AKTIF') return { ok: false, msg: 'Akaun anda berstatus ' + u.STATUS + '. Hubungi Admin Negeri.' };
    if (u.PERANAN === 'JURULATIH') {
      var g = cariSatu_('GELANGGANG', 'KOD', u.KOD_GELANGGANG);
      if (!g || g.STATUS === 'DISEKAT') return { ok: false, msg: 'Gelanggang anda disekat. Hubungi Admin.' };
      if (g.STATUS === 'MENUNGGU') return { ok: false, msg: 'Gelanggang anda masih menunggu kelulusan.' };
      catatAktiviti_(g.KOD);
    }
    kemaskini_('PENGGUNA', u._r, { GAGAL: '0', KUNCI_HINGGA: '' });
    var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    tambah_('SESI', { TOKEN: token, ID: id, LUPUT: String(Date.now() + SESI_HARI * 86400000) });
    bersihSesi_();
    log_(id, 'LOG_MASUK', '');
    return { ok: true, token: token, pengguna: profil_(u) };
  }
};

function bersihSesi_() {
  var rs = baca_('SESI'), kini = Date.now(), sh = sh_('SESI');
  if (rs.length < 200) return;
  for (var i = rs.length - 1; i >= 0; i--) if (Number(rs[i].LUPUT) < kini) sh.deleteRow(rs[i]._r);
  delete _tbl.SESI;
}
function profil_(u) {
  var g = u.KOD_GELANGGANG ? cariSatu_('GELANGGANG', 'KOD', u.KOD_GELANGGANG) : null;
  return { id: u.ID, nama: u.NAMA, telefon: u.TELEFON, peranan: u.PERANAN, negeri: u.NEGERI,
    namaNegeri: namaNegeri_(u.NEGERI), kod_gelanggang: u.KOD_GELANGGANG, nama_gelanggang: g ? g.NAMA : '', logo: g ? g.LOGO : '',
    ketua: u.KETUA === 'YA', wajib_tukar: u.WAJIB_TUKAR === 'YA' };
}

/* ======================= TINDAKAN BERTOKEN ======================= */
var API = {};

API.saya = function (u) { return { ok: true, pengguna: profil_(u), negeri: NEGERI }; };

API.logout = function (u, p) {
  var s = cariSatu_('SESI', 'TOKEN', p.token);
  if (s) sh_('SESI').deleteRow(s._r);
  CacheService.getScriptCache().remove('t_' + p.token);
  return { ok: true };
};

API.tukar_katalaluan = function (u, p) {
  if (hash_(p.lama || '', u.SALT) !== u.HASH) return { ok: false, msg: 'Kata laluan lama salah.' };
  if (String(p.baru || '').length < 8) return { ok: false, msg: 'Kata laluan baharu sekurang-kurangnya 8 aksara.' };
  var salt = Utilities.getUuid();
  kemaskini_('PENGGUNA', u._r, { HASH: hash_(p.baru, salt), SALT: salt, WAJIB_TUKAR: '' });
  log_(u.ID, 'TUKAR_KATALALUAN', '');
  return { ok: true, msg: 'Kata laluan ditukar.' };
};

API.kemaskini_profil = function (u, p) {
  var nama = String(p.nama || '').trim().replace(/\s+/g, ' ');
  var tel = String(p.telefon || '').replace(/[\s-]/g, '');
  if (nama.length < 3 || nama.length > 80) return { ok: false, msg: 'Nama mesti 3–80 aksara.' };
  if (!/^\+?\d{9,13}$/.test(tel)) return { ok: false, msg: 'No. telefon tidak sah. Contoh: 0123456789' };
  kemaskini_('PENGGUNA', u._r, { NAMA: nama, TELEFON: tel });
  log_(u.ID, 'KEMASKINI_PROFIL', 'Nama/telefon dikemaskini');
  return { ok: true, msg: 'Maklumat akaun dikemaskini.', nama: nama, telefon: tel };
};

/* ---------- Gelanggang ---------- */
API.senarai_gelanggang = function (u) {
  var peng = baca_('PENGGUNA');
  var gel = baca_('GELANGGANG').filter(function (g) { return bolehGel_(u, g); }).map(function (g) {
    var k = cariSatu_('PENGGUNA', 'ID', g.KETUA_ID);
    return { kod: g.KOD, nama: g.NAMA, negeri: g.NEGERI, alamat: g.ALAMAT, status: g.STATUS,
      tarikh: g.TARIKH_DAFTAR, aktiviti: g.AKTIVITI_TERAKHIR, ketua: k ? k.NAMA : '', telKetua: k ? k.TELEFON : '',
      jurulatih: peng.filter(function (x) { return x.KOD_GELANGGANG === g.KOD; }).length };
  });
  return { ok: true, gelanggang: gel };
};

API.lulus_gelanggang = function (u, p) {
  wajib_(u, ['SUPER_ADMIN', 'ADMIN_NEGERI']);
  var g = cariSatu_('GELANGGANG', 'KOD', p.kod);
  if (!g || !bolehGel_(u, g)) return { ok: false, msg: 'Gelanggang tidak dijumpai.' };
  if (g.STATUS !== 'MENUNGGU') return { ok: false, msg: 'Gelanggang ini bukan berstatus MENUNGGU.' };
  var k3 = String(p.kod3 || '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(k3)) return { ok: false, msg: 'Kod gelanggang mesti 3 huruf (cth. SMT).' };
  var baru = g.NEGERI + '-' + k3;
  if (kodDipakai_(baru)) return { ok: false, msg: 'Kod ' + baru + ' sudah digunakan dalam negeri ini.' };
  kemaskini_('GELANGGANG', g._r, { KOD: baru, STATUS: 'AKTIF', AKTIVITI_TERAKHIR: hariIni_() });
  baca_('PENGGUNA').forEach(function (x) {
    if (x.KOD_GELANGGANG === g.KOD) kemaskini_('PENGGUNA', x._r, { KOD_GELANGGANG: baru });
  });
  log_(u.ID, 'LULUS_GELANGGANG', g.KOD + ' → ' + baru);
  return { ok: true, msg: 'Gelanggang diluluskan dengan kod ' + baru + '. Jangan lupa luluskan jurulatihnya.' };
};

API.status_gelanggang = function (u, p) {
  wajib_(u, ['SUPER_ADMIN', 'ADMIN_NEGERI']);
  var g = cariSatu_('GELANGGANG', 'KOD', p.kod);
  if (!g || !bolehGel_(u, g)) return { ok: false, msg: 'Gelanggang tidak dijumpai.' };
  var s = p.status;
  if (['AKTIF', 'TIDAK AKTIF', 'DISEKAT'].indexOf(s) < 0) return { ok: false, msg: 'Status tidak sah.' };
  if (u.PERANAN !== 'SUPER_ADMIN' && (s === 'DISEKAT' || g.STATUS === 'DISEKAT'))
    return { ok: false, msg: 'Hanya Super Admin boleh sekat / buka sekatan gelanggang.' };
  if (g.STATUS === 'MENUNGGU' && s === 'AKTIF') return { ok: false, msg: 'Guna butang Luluskan untuk beri kod.' };
  kemaskini_('GELANGGANG', g._r, { STATUS: s });
  log_(u.ID, 'STATUS_GELANGGANG', g.KOD + ' → ' + s);
  return { ok: true, msg: 'Status gelanggang ' + g.NAMA + ' kini ' + s + '.' };
};

API.mohon_gelanggang = function (u, p) {
  // Kemaskini nama/alamat gelanggang oleh ketua / admin
  var g = cariSatu_('GELANGGANG', 'KOD', p.kod);
  if (!g || !bolehGel_(u, g)) return { ok: false, msg: 'Gelanggang tidak dijumpai.' };
  if (u.PERANAN === 'JURULATIH' && u.KETUA !== 'YA') return { ok: false, msg: 'Hanya ketua gelanggang boleh ubah maklumat ini.' };
  kemaskini_('GELANGGANG', g._r, { NAMA: p.nama || g.NAMA, ALAMAT: p.alamat == null ? g.ALAMAT : p.alamat });
  log_(u.ID, 'UBAH_GELANGGANG', g.KOD);
  return { ok: true, msg: 'Maklumat gelanggang dikemas kini.' };
};

/* ---------- Pengguna ---------- */
API.senarai_pengguna = function (u) {
  wajib_(u, ['SUPER_ADMIN', 'ADMIN_NEGERI']);
  var gel = {}; baca_('GELANGGANG').forEach(function (g) { gel[g.KOD] = g; });
  var rs = baca_('PENGGUNA').filter(function (x) {
    if (x.PERANAN === 'SUPER_ADMIN') return false;
    if (u.PERANAN === 'SUPER_ADMIN') return true;
    return x.PERANAN === 'JURULATIH' && x.NEGERI === u.NEGERI;
  }).map(function (x) {
    var g = gel[x.KOD_GELANGGANG];
    return { id: x.ID, nama: x.NAMA, telefon: x.TELEFON, peranan: x.PERANAN, negeri: x.NEGERI,
      kod_gelanggang: x.KOD_GELANGGANG, nama_gelanggang: g ? g.NAMA : '', status_gelanggang: g ? g.STATUS : '',
      ketua: x.KETUA === 'YA', status: x.STATUS, tarikh: x.TARIKH_DAFTAR };
  });
  return { ok: true, pengguna: rs };
};

API.status_pengguna = function (u, p) {
  wajib_(u, ['SUPER_ADMIN', 'ADMIN_NEGERI']);
  var x = cariSatu_('PENGGUNA', 'ID', p.id);
  if (!x || x.PERANAN === 'SUPER_ADMIN') return { ok: false, msg: 'Pengguna tidak dijumpai.' };
  if (u.PERANAN === 'ADMIN_NEGERI' && (x.PERANAN !== 'JURULATIH' || x.NEGERI !== u.NEGERI))
    return { ok: false, msg: 'Di luar skop negeri anda.' };
  if (['AKTIF', 'DIGANTUNG', 'DITOLAK'].indexOf(p.status) < 0) return { ok: false, msg: 'Status tidak sah.' };
  if (p.status === 'AKTIF' && x.PERANAN === 'JURULATIH') {
    var g = cariSatu_('GELANGGANG', 'KOD', x.KOD_GELANGGANG);
    if (!g || g.STATUS !== 'AKTIF') return { ok: false, msg: 'Luluskan gelanggangnya dahulu (tab Kelulusan).' };
  }
  kemaskini_('PENGGUNA', x._r, { STATUS: p.status });
  log_(u.ID, 'STATUS_PENGGUNA', x.ID + ' → ' + p.status);
  return { ok: true, msg: x.NAMA + ' kini ' + p.status + '.' };
};

API.set_ketua = function (u, p) {
  wajib_(u, ['SUPER_ADMIN', 'ADMIN_NEGERI']);
  var x = cariSatu_('PENGGUNA', 'ID', p.id);
  if (!x || x.PERANAN !== 'JURULATIH') return { ok: false, msg: 'Jurulatih tidak dijumpai.' };
  if (u.PERANAN === 'ADMIN_NEGERI' && x.NEGERI !== u.NEGERI) return { ok: false, msg: 'Di luar skop negeri anda.' };
  kemaskini_('PENGGUNA', x._r, { KETUA: p.ketua ? 'YA' : 'TIDAK' });
  if (p.ketua) {
    var g = cariSatu_('GELANGGANG', 'KOD', x.KOD_GELANGGANG);
    if (g) kemaskini_('GELANGGANG', g._r, { KETUA_ID: x.ID });
  }
  log_(u.ID, 'SET_KETUA', x.ID + ' = ' + (p.ketua ? 'YA' : 'TIDAK'));
  return { ok: true, msg: 'Dikemas kini.' };
};

API.lantik_admin = function (u, p) {
  wajib_(u, ['SUPER_ADMIN']);
  var id = String(p.id || '').trim().toLowerCase();
  if (!/^[a-z0-9._]{4,30}$/.test(id)) return { ok: false, msg: 'ID tidak sah.' };
  if (!NEGERI.some(function (n) { return n[0] === p.negeri; })) return { ok: false, msg: 'Pilih negeri.' };
  var x = cariSatu_('PENGGUNA', 'ID', id);
  if (x) {
    if (x.PERANAN === 'SUPER_ADMIN') return { ok: false, msg: 'Tidak boleh.' };
    kemaskini_('PENGGUNA', x._r, { PERANAN: 'ADMIN_NEGERI', NEGERI: p.negeri, STATUS: 'AKTIF' });
    log_(u.ID, 'LANTIK_ADMIN', id + ' (sedia ada) → ' + p.negeri);
    return { ok: true, msg: x.NAMA + ' dilantik sebagai Admin Negeri ' + namaNegeri_(p.negeri) + '.' + gantiAdmin_(u, p.ganti, id) };
  }
  if (String(p.katalaluan || '').length < 8) return { ok: false, msg: 'Kata laluan sekurang-kurangnya 8 aksara.' };
  var salt = Utilities.getUuid();
  tambah_('PENGGUNA', { ID: id, HASH: hash_(p.katalaluan, salt), SALT: salt, NAMA: p.nama || id, TELEFON: p.telefon || '',
    PERANAN: 'ADMIN_NEGERI', NEGERI: p.negeri, KOD_GELANGGANG: '', KETUA: 'TIDAK', STATUS: 'AKTIF',
    TARIKH_DAFTAR: hariIni_(), GAGAL: '0', KUNCI_HINGGA: '' });
  log_(u.ID, 'LANTIK_ADMIN', id + ' → ' + p.negeri);
  return { ok: true, msg: 'Admin Negeri ' + id + ' dicipta. Beri ID & kata laluan kepadanya.' + gantiAdmin_(u, p.ganti, id) };
};
/* Gantikan admin lama: akaun lama digantung & semua sesinya dibatalkan */
function gantiAdmin_(u, idLama, idBaru) {
  if (!idLama || idLama === idBaru) return '';
  var x = cariSatu_('PENGGUNA', 'ID', idLama);
  if (!x || x.PERANAN !== 'ADMIN_NEGERI') return '';
  kemaskini_('PENGGUNA', x._r, { STATUS: 'DIGANTUNG' });
  var sh = sh_('SESI'), rs = baca_('SESI'), c = CacheService.getScriptCache();
  for (var k = rs.length - 1; k >= 0; k--) if (rs[k].ID === x.ID) { c.remove('t_' + rs[k].TOKEN); sh.deleteRow(rs[k]._r); }
  delete _tbl.SESI;
  log_(u.ID, 'GANTI_ADMIN', idLama + ' → ' + idBaru);
  return ' Admin lama (' + x.NAMA + ') telah digantung.';
}
/* Ubah maklumat / pindah negeri Admin Negeri */
API.ubah_admin = function (u, p) {
  wajib_(u, ['SUPER_ADMIN']);
  var x = cariSatu_('PENGGUNA', 'ID', p.id);
  if (!x || x.PERANAN !== 'ADMIN_NEGERI') return { ok: false, msg: 'Admin Negeri tidak dijumpai.' };
  if (!NEGERI.some(function (n) { return n[0] === p.negeri; })) return { ok: false, msg: 'Pilih negeri.' };
  var nama = String(p.nama || '').trim(); if (!nama) return { ok: false, msg: 'Nama wajib.' };
  kemaskini_('PENGGUNA', x._r, { NAMA: nama.slice(0, 100), TELEFON: String(p.telefon || '').trim().slice(0, 20), NEGERI: p.negeri });
  log_(u.ID, 'UBAH_ADMIN', x.ID + (x.NEGERI !== p.negeri ? ' ' + x.NEGERI + ' → ' + p.negeri : ''));
  return { ok: true, msg: 'Maklumat ' + nama + ' dikemas kini.' };
};

/* ---------- Ahli ---------- */
function gelAhli_(u, kod) {
  var k = u.PERANAN === 'JURULATIH' ? u.KOD_GELANGGANG : kod;
  var g = cariSatu_('GELANGGANG', 'KOD', k);
  if (!g || !bolehGel_(u, g)) throw new Error('Gelanggang tidak dijumpai atau di luar skop anda.');
  return g;
}
function kpPenuh_(u, kodGel) {
  return u.PERANAN === 'SUPER_ADMIN' || (u.PERANAN === 'JURULATIH' && u.KOD_GELANGGANG === kodGel);
}
function ahliObj_(a, k, u, kodGel, yuranTahun) {
  return { no_ahli: a.NO_AHLI, no_kp: kpPenuh_(u, kodGel) ? a.NO_KP : topengKP_(a.NO_KP), nama: a.NAMA,
    jantina: a.JANTINA, tarikh_lahir: a.TARIKH_LAHIR, bengkung: a.BENGKUNG, gelanggang_utama: a.GELANGGANG_UTAMA,
    status: a.STATUS, tarikh_daftar: a.TARIKH_DAFTAR, tel_waris: a.TEL_WARIS, id_lama: a.ID_LAMA,
    jenis: k ? k.JENIS : '', status_gel: k ? k.STATUS : '', cawangan: k ? k.CAWANGAN : '', yuran: yuranTahun || '' };
}

API.senarai_ahli = function (u, p) {
  var g = gelAhli_(u, p.kod), tahun = String(p.tahun || new Date().getFullYear());
  var ahli = {}; baca_('AHLI').forEach(function (a) { ahli[a.NO_KP] = a; });
  var yur = {}; baca_('YURAN_TAHUNAN').forEach(function (y) { if (y.TAHUN === tahun) yur[y.NO_KP] = y.JUMLAH ? 'RM' + y.JUMLAH : 'Ya'; });
  var rs = baca_('KEAHLIAN_GELANGGANG').filter(function (k) { return k.KOD_GELANGGANG === g.KOD; })
    .map(function (k) { var a = ahli[k.NO_KP]; return a ? ahliObj_(a, k, u, g.KOD, yur[a.NO_KP]) : null; })
    .filter(function (x) { return x; });
  rs.sort(function (a, b) { return a.nama.localeCompare(b.nama); });
  var cw = {}; baca_('CAWANGAN').forEach(function (c) { if (c.KOD_GELANGGANG === g.KOD && c.STATUS !== 'PADAM') cw[c.ID] = c.NAMA; });
  rs.forEach(function (x) { x.nama_cawangan = cw[x.cawangan] || ''; });
  return { ok: true, gelanggang: { kod: g.KOD, nama: g.NAMA, negeri: g.NEGERI }, cawangan: Object.keys(cw).map(function (id) { return { id: id, nama: cw[id] }; }), ahli: rs, tahun: tahun };
};

API.semak_kp = function (u, p) {
  var g = gelAhli_(u, p.kod), kp = bersihKP_(p.no_kp);
  var a = cariSatu_('AHLI', 'NO_KP', kp);
  if (!a) return { ok: true, wujud: false, no_kp: kp };
  var gelNama = {}; baca_('GELANGGANG').forEach(function (x) { gelNama[x.KOD] = x.NAMA + ' (' + namaNegeri_(x.NEGERI) + ')'; });
  var ks = baca_('KEAHLIAN_GELANGGANG').filter(function (k) { return k.NO_KP === kp; })
    .map(function (k) { return { kod: k.KOD_GELANGGANG, nama: gelNama[k.KOD_GELANGGANG] || k.KOD_GELANGGANG, jenis: k.JENIS, status: k.STATUS }; });
  var sudah = ks.some(function (k) { return k.kod === g.KOD && k.status !== 'BERPINDAH'; });
  return { ok: true, wujud: true, sudahDiSini: sudah, ahli: { no_ahli: a.NO_AHLI, nama: a.NAMA, status: a.STATUS,
    utama: gelNama[a.GELANGGANG_UTAMA] || a.GELANGGANG_UTAMA }, keahlian: ks };
};

function siriBaru_(kodGel) {
  var max = 0, pre = kodGel + '-';
  baca_('AHLI').forEach(function (a) {
    if (a.NO_AHLI.indexOf(pre) === 0) { var n = parseInt(a.NO_AHLI.slice(pre.length), 10); if (n > max) max = n; }
  });
  return pre + ('000' + (max + 1)).slice(-4);
}

function daftarAhliTeras_(g, d, mod, oleh) {
  var kp = bersihKP_(d.no_kp);
  if (!kp || kp.length < 6) return { ok: false, msg: 'No. KP tidak sah.' };
  var a = cariSatu_('AHLI', 'NO_KP', kp), kini = hariIni_();
  if (!a) {
    if (!d.nama) return { ok: false, msg: 'Nama wajib.' };
    var no = siriBaru_(g.KOD);
    tambah_('AHLI', { NO_AHLI: no, NO_KP: kp, NAMA: String(d.nama).trim().toUpperCase(), JANTINA: d.jantina || '',
      TARIKH_LAHIR: d.tarikh_lahir || '', BENGKUNG: d.bengkung || '', GELANGGANG_UTAMA: g.KOD, STATUS: d.status || 'AKTIF',
      TARIKH_DAFTAR: d.tarikh_daftar || kini, TEL_WARIS: d.tel_waris || '', ID_LAMA: d.id_lama || '' });
    tambah_('KEAHLIAN_GELANGGANG', { NO_KP: kp, KOD_GELANGGANG: g.KOD, JENIS: 'UTAMA', STATUS: 'AKTIF', TARIKH_MULA: kini, TARIKH_TAMAT: '', CAWANGAN: d.cawangan || '' });
    log_(oleh, 'DAFTAR_AHLI', no);
    return { ok: true, msg: 'Ahli didaftar: ' + no, no_ahli: no, baru: true };
  }
  var ks = baca_('KEAHLIAN_GELANGGANG').filter(function (k) { return k.NO_KP === kp; });
  var diSini = ks.filter(function (k) { return k.KOD_GELANGGANG === g.KOD && k.STATUS !== 'BERPINDAH'; })[0];
  if (mod === 'pindah') {
    ks.forEach(function (k) {
      if (k.JENIS === 'UTAMA' && k.STATUS !== 'BERPINDAH' && k.KOD_GELANGGANG !== g.KOD)
        kemaskini_('KEAHLIAN_GELANGGANG', k._r, { STATUS: 'BERPINDAH', TARIKH_TAMAT: kini });
    });
    if (diSini) kemaskini_('KEAHLIAN_GELANGGANG', diSini._r, { JENIS: 'UTAMA', STATUS: 'AKTIF', CAWANGAN: d.cawangan || diSini.CAWANGAN });
    else tambah_('KEAHLIAN_GELANGGANG', { NO_KP: kp, KOD_GELANGGANG: g.KOD, JENIS: 'UTAMA', STATUS: 'AKTIF', TARIKH_MULA: kini, TARIKH_TAMAT: '', CAWANGAN: d.cawangan || '' });
    kemaskini_('AHLI', a._r, { GELANGGANG_UTAMA: g.KOD, STATUS: 'AKTIF' });
    log_(oleh, 'PINDAH_AHLI', a.NO_AHLI + ' → ' + g.KOD);
    return { ok: true, msg: a.NAMA + ' dipindahkan ke gelanggang ini. No. ahli kekal: ' + a.NO_AHLI, no_ahli: a.NO_AHLI };
  }
  if (mod === 'bersama') {
    if (diSini) return { ok: false, msg: 'Ahli ini sudah berdaftar di gelanggang ini.' };
    tambah_('KEAHLIAN_GELANGGANG', { NO_KP: kp, KOD_GELANGGANG: g.KOD, JENIS: 'BERSAMA', STATUS: 'AKTIF', TARIKH_MULA: kini, TARIKH_TAMAT: '', CAWANGAN: d.cawangan || '' });
    log_(oleh, 'AHLI_BERSAMA', a.NO_AHLI + ' + ' + g.KOD);
    return { ok: true, msg: a.NAMA + ' ditambah sebagai Ahli Bersama. No. ahli: ' + a.NO_AHLI, no_ahli: a.NO_AHLI };
  }
  return { ok: false, pendua: true, msg: 'No. KP ini sudah berdaftar (' + a.NO_AHLI + '). Pilih Pindah atau Ahli Bersama.' };
}

API.daftar_ahli = function (u, p) {
  var g = gelAhli_(u, p.kod);
  if (g.STATUS !== 'AKTIF') return { ok: false, msg: 'Gelanggang tidak aktif.' };
  if (!p.pdpa) return { ok: false, msg: 'Sila sahkan persetujuan PDPA.' };
  var r = daftarAhliTeras_(g, p.data || {}, p.mod, u.ID);
  if (r.ok) catatAktiviti_(g.KOD);
  return r;
};

API.kemaskini_ahli = function (u, p) {
  var a = cariSatu_('AHLI', 'NO_AHLI', p.no_ahli);
  if (!a) return { ok: false, msg: 'Ahli tidak dijumpai.' };
  var g = cariSatu_('GELANGGANG', 'KOD', a.GELANGGANG_UTAMA);
  if (!bolehGel_(u, g)) return { ok: false, msg: 'Hanya gelanggang utama ahli boleh ubah maklumatnya.' };
  var d = p.data || {}, upd = {};
  ['NAMA', 'JANTINA', 'TARIKH_LAHIR', 'BENGKUNG', 'TEL_WARIS'].forEach(function (k) {
    var v = d[k.toLowerCase()]; if (v != null) upd[k] = k === 'NAMA' ? String(v).trim().toUpperCase() : v;
  });
  kemaskini_('AHLI', a._r, upd);
  log_(u.ID, 'UBAH_AHLI', a.NO_AHLI);
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Maklumat ahli dikemas kini.' };
};

API.status_ahli = function (u, p) {
  var a = cariSatu_('AHLI', 'NO_AHLI', p.no_ahli);
  if (!a) return { ok: false, msg: 'Ahli tidak dijumpai.' };
  var g = gelAhli_(u, p.kod);
  if (['AKTIF', 'TIDAK AKTIF', 'DIGANTUNG', 'DIBATALKAN'].indexOf(p.status) < 0) return { ok: false, msg: 'Status tidak sah.' };
  var k = baca_('KEAHLIAN_GELANGGANG').filter(function (x) { return x.NO_KP === a.NO_KP && x.KOD_GELANGGANG === g.KOD && x.STATUS !== 'BERPINDAH'; })[0];
  if (!k) return { ok: false, msg: 'Ahli bukan dari gelanggang ini.' };
  kemaskini_('KEAHLIAN_GELANGGANG', k._r, { STATUS: p.status });
  if (k.JENIS === 'UTAMA') kemaskini_('AHLI', a._r, { STATUS: p.status });
  log_(u.ID, 'STATUS_AHLI', a.NO_AHLI + ' @' + g.KOD + ' → ' + p.status);
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Status ' + a.NAMA + ' kini ' + p.status + '.' };
};

/* ---------- Yuran tahunan ---------- */
API.rekod_yuran = function (u, p) {
  var g = gelAhli_(u, p.kod), a = cariSatu_('AHLI', 'NO_AHLI', p.no_ahli);
  if (!a) return { ok: false, msg: 'Ahli tidak dijumpai.' };
  var tahun = String(p.tahun || '').trim();
  if (!/^\d{4}$/.test(tahun)) return { ok: false, msg: 'Tahun tidak sah.' };
  var ada = baca_('KEAHLIAN_GELANGGANG').some(function (k) { return k.NO_KP === a.NO_KP && k.KOD_GELANGGANG === g.KOD; });
  if (!ada) return { ok: false, msg: 'Ahli bukan dari gelanggang ini.' };
  var lama = baca_('YURAN_TAHUNAN').filter(function (y) { return y.NO_KP === a.NO_KP && y.TAHUN === tahun; });
  if (lama.length && !p.paksa) {
    return { ok: false, amaran: true, msg: 'AMARAN: Yuran tahun ' + tahun + ' untuk ' + a.NAMA + ' sudah direkod (' +
      lama.map(function (y) { return y.KOD_GELANGGANG + ', RM' + y.JUMLAH + ', ' + y.TARIKH_BAYAR; }).join('; ') + '). Rekod juga?' };
  }
  tambah_('YURAN_TAHUNAN', { NO_KP: a.NO_KP, KOD_GELANGGANG: g.KOD, TAHUN: tahun, JUMLAH: String(p.jumlah || ''),
    TARIKH_BAYAR: p.tarikh || hariIni_(), DIREKOD_OLEH: u.ID });
  log_(u.ID, 'REKOD_YURAN', a.NO_AHLI + ' ' + tahun);
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Yuran tahunan ' + tahun + ' direkod untuk ' + a.NAMA + '.' };
};

API.sejarah_yuran = function (u, p) {
  var a = cariSatu_('AHLI', 'NO_AHLI', p.no_ahli);
  if (!a) return { ok: false, msg: 'Ahli tidak dijumpai.' };
  var ks = baca_('KEAHLIAN_GELANGGANG').filter(function (k) { return k.NO_KP === a.NO_KP; });
  var boleh = ks.some(function (k) { return bolehGel_(u, cariSatu_('GELANGGANG', 'KOD', k.KOD_GELANGGANG)); });
  if (!boleh) return { ok: false, msg: 'Di luar skop anda.' };
  var ys = baca_('YURAN_TAHUNAN').filter(function (y) { return y.NO_KP === a.NO_KP; })
    .map(function (y) { return { tahun: y.TAHUN, jumlah: y.JUMLAH, tarikh: y.TARIKH_BAYAR, gel: y.KOD_GELANGGANG }; });
  ys.sort(function (x, y) { return y.tahun.localeCompare(x.tahun); });
  return { ok: true, yuran: ys, keahlian: ks.map(function (k) { return { kod: k.KOD_GELANGGANG, jenis: k.JENIS, status: k.STATUS, mula: k.TARIKH_MULA, tamat: k.TARIKH_TAMAT }; }) };
};

/* ---------- Papan pemuka ---------- */
API.papan = function (u, p) {
  wajib_(u, ['SUPER_ADMIN', 'ADMIN_NEGERI']);
  var tahun = String(p.tahun || new Date().getFullYear());
  var kunci = 'papan_' + versi_() + '_' + u.PERANAN + '_' + u.NEGERI + '_' + tahun;
  var c = CacheService.getScriptCache(), sim = c.get(kunci);
  if (sim) return JSON.parse(sim);

  var gelSemua = baca_('GELANGGANG'), gelMap = {};
  gelSemua.forEach(function (g) { gelMap[g.KOD] = g; });
  var had = Date.now() - HARI_AKTIF * 86400000;

  // Populasi: setiap ahli dikira SEKALI ikut gelanggang utama
  var ikutNegeri = {}, jumlah = { L: 0, P: 0, semua: 0 }, statGel = {}, thIni = new Date().getFullYear();
  baca_('AHLI').forEach(function (a) {
    if (a.STATUS !== 'AKTIF') return;
    var g = gelMap[a.GELANGGANG_UTAMA]; if (!g) return;
    if (u.PERANAN === 'ADMIN_NEGERI' && g.NEGERI !== u.NEGERI) return;
    var n = ikutNegeri[g.NEGERI] || (ikutNegeri[g.NEGERI] = { negeri: g.NEGERI, nama: namaNegeri_(g.NEGERI), L: 0, P: 0, semua: 0 });
    var j = /^P/i.test(a.JANTINA) ? 'P' : 'L';
    n[j]++; n.semua++; jumlah[j]++; jumlah.semua++;
    // Statistik infografik ikut gelanggang utama (K = kanak-kanak ≤12, M = menengah 13–17, D = dewasa 18+, X = tiada tarikh lahir)
    var sg = statGel[g.KOD] || (statGel[g.KOD] = { L: 0, P: 0, K: 0, M: 0, D: 0, X: 0, b: {} });
    sg[j]++;
    var y = Number(String(a.TARIKH_LAHIR || '').slice(0, 4));
    if (!y) { var d = String(a.NO_KP || '').replace(/\D/g, ''); if (d.length >= 6) { y = Number(d.slice(0, 2)); y += y > thIni % 100 ? 1900 : 2000; } }
    var um = y ? thIni - y : null;
    sg[um == null ? 'X' : um <= 12 ? 'K' : um <= 17 ? 'M' : 'D']++;
    var bk = String(a.BENGKUNG || '').trim() || '-';
    sg.b[bk] = (sg.b[bk] || 0) + 1;
  });

  var bilAhli = {}, bilBersama = {}, statCaw = {}, ahliMap = {};
  baca_('AHLI').forEach(function (a) { ahliMap[a.NO_KP] = a; });
  var cawNama = {}; baca_('CAWANGAN').forEach(function (c) { if (c.STATUS !== 'PADAM') cawNama[c.ID] = { nama: c.NAMA, gel: c.KOD_GELANGGANG }; });
  baca_('KEAHLIAN_GELANGGANG').forEach(function (k) {
    if (k.STATUS !== 'AKTIF') return;
    // Pecahan ikut cawangan (ahli aktif di gelanggang itu, termasuk ahli bersama)
    var cid = k.CAWANGAN && cawNama[k.CAWANGAN] ? k.CAWANGAN : '', a = ahliMap[k.NO_KP] || {};
    var sc = (statCaw[k.KOD_GELANGGANG] = statCaw[k.KOD_GELANGGANG] || {});
    var st = sc[cid] || (sc[cid] = { id: cid, nama: cid ? cawNama[cid].nama : 'Belum ditag cawangan', L: 0, P: 0, K: 0, M: 0, D: 0, X: 0, b: {} });
    st[/^P/i.test(a.JANTINA) ? 'P' : 'L']++;
    var y = Number(String(a.TARIKH_LAHIR || '').slice(0, 4));
    if (!y) { var dk = String(a.NO_KP || '').replace(/\D/g, ''); if (dk.length >= 6) { y = Number(dk.slice(0, 2)); y += y > thIni % 100 ? 1900 : 2000; } }
    var um = y ? thIni - y : null; st[um == null ? 'X' : um <= 12 ? 'K' : um <= 17 ? 'M' : 'D']++;
    var bk = String(a.BENGKUNG || '').trim() || '-'; st.b[bk] = (st.b[bk] || 0) + 1;
    bilAhli[k.KOD_GELANGGANG] = (bilAhli[k.KOD_GELANGGANG] || 0) + 1;
    if (k.JENIS === 'BERSAMA') bilBersama[k.KOD_GELANGGANG] = (bilBersama[k.KOD_GELANGGANG] || 0) + 1;
  });
  var bilYuran = {}, jumYuran = {};
  baca_('YURAN_TAHUNAN').forEach(function (y) {
    if (y.TAHUN !== tahun) return;
    bilYuran[y.KOD_GELANGGANG] = (bilYuran[y.KOD_GELANGGANG] || 0) + 1;
    jumYuran[y.KOD_GELANGGANG] = (jumYuran[y.KOD_GELANGGANG] || 0) + (Number(y.JUMLAH) || 0);
  });
  var peng = baca_('PENGGUNA'), pengMap = {};
  peng.forEach(function (x) { pengMap[x.ID] = x; });

  var gelList = [], aktif = 0, tidakAktif = 0;
  gelSemua.forEach(function (g) {
    if (!bolehGel_(u, g) || g.STATUS === 'MENUNGGU') return;
    var ak = g.STATUS === 'AKTIF' && g.AKTIVITI_TERAKHIR && nomborHari_(g.AKTIVITI_TERAKHIR) >= had;
    if (ak) aktif++; else tidakAktif++;
    var k = pengMap[g.KETUA_ID];
    gelList.push({ kod: g.KOD, nama: g.NAMA, negeri: g.NEGERI, status: g.STATUS, aktif60: !!ak, aktiviti: g.AKTIVITI_TERAKHIR,
      ketua: k ? k.NAMA : '', telKetua: k ? k.TELEFON : '', ahli: bilAhli[g.KOD] || 0, bersama: bilBersama[g.KOD] || 0,
      bayar: bilYuran[g.KOD] || 0, kutipan: jumYuran[g.KOD] || 0,
      jurulatih: peng.filter(function (x) { return x.PERANAN === 'JURULATIH' && x.KOD_GELANGGANG === g.KOD && x.STATUS !== 'DITOLAK'; })
        .map(function (x) { return { nama: x.NAMA, telefon: x.TELEFON, ketua: x.KETUA === 'YA', status: x.STATUS }; }),
      cawangan: Object.keys(cawNama).filter(function (id) { return cawNama[id].gel === g.KOD; }).map(function (id) { return (statCaw[g.KOD] || {})[id] || { id: id, nama: cawNama[id].nama, L: 0, P: 0, K: 0, M: 0, D: 0, X: 0, b: {} }; })
        .concat((statCaw[g.KOD] || {})[''] && Object.keys(cawNama).some(function (id) { return cawNama[id].gel === g.KOD; }) ? [statCaw[g.KOD]['']] : []),
      stat: statGel[g.KOD] || { L: 0, P: 0, K: 0, M: 0, D: 0, X: 0, b: {} } });
  });
  gelList.sort(function (a, b) { return (a.negeri + a.nama).localeCompare(b.negeri + b.nama); });

  var menungguGel = gelSemua.filter(function (g) { return g.STATUS === 'MENUNGGU' && bolehGel_(u, g); }).map(function (g) {
    var k = pengMap[g.KETUA_ID];
    return { kod: g.KOD, nama: g.NAMA, negeri: g.NEGERI, alamat: g.ALAMAT, tarikh: g.TARIKH_DAFTAR, pemohon: k ? k.NAMA : '', tel: k ? k.TELEFON : '' };
  });
  var menungguJur = peng.filter(function (x) {
    return x.PERANAN === 'JURULATIH' && x.STATUS === 'MENUNGGU' && (u.PERANAN === 'SUPER_ADMIN' || x.NEGERI === u.NEGERI);
  }).map(function (x) {
    var g = gelMap[x.KOD_GELANGGANG];
    return { id: x.ID, nama: x.NAMA, telefon: x.TELEFON, negeri: x.NEGERI, kod_gelanggang: x.KOD_GELANGGANG,
      nama_gelanggang: g ? g.NAMA : '?', status_gelanggang: g ? g.STATUS : '', ketua: x.KETUA === 'YA', tarikh: x.TARIKH_DAFTAR };
  });

  var r = { ok: true, tahun: tahun, jumlah: jumlah, negeri: Object.keys(ikutNegeri).sort().map(function (k) { return ikutNegeri[k]; }),
    segerak: PropertiesService.getScriptProperties().getProperty('SEGERAK_TERAKHIR') || '',
    gelAktif: aktif, gelTidakAktif: tidakAktif, gelanggang: gelList, menungguGel: menungguGel, menungguJur: menungguJur };
  try { c.put(kunci, JSON.stringify(r), 300); } catch (x) {}
  return r;
};

/* ======================= IMPORT SISTEM LAMA ======================= */
/* Cara guna:
 *  - Sekali sahaja: pilih "pasangSegerakAuto" → Run. Selepas itu data Seri Mutiara
 *    disalin ke Pusat setiap 5 minit secara automatik (sistem lama tidak diubah).
 *  - Segerak segera secara manual: pilih "jalankanImport" → Run.
 *  - Hentikan auto: pilih "hentikanSegerakAuto" → Run. */
function jalankanImport() {
  var r = importDariSheetLama(IMPORT_ID_SHEET_LAMA, IMPORT_KOD_GELANGGANG);
  Logger.log(JSON.stringify(r, null, 2));
}
function pasangSegerakAuto() {
  hentikanSegerakAuto();
  ScriptApp.newTrigger('jalankanImport').timeBased().everyMinutes(SEGERAK_MINIT).create();
  jalankanImport();
  Logger.log('BERJAYA: Segerak auto dipasang (setiap ' + SEGERAK_MINIT + ' minit).');
}
function hentikanSegerakAuto() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'jalankanImport') ScriptApp.deleteTrigger(t);
  });
}
function statusLama_(v) {
  var s = String(v || 'AKTIF').toUpperCase().trim();
  if (s === 'TIDAK AKTIF' || s === 'TIDAK_AKTIF' || s === 'TAK AKTIF') return 'TIDAK AKTIF';
  if (['AKTIF', 'DIGANTUNG', 'DIBATALKAN'].indexOf(s) >= 0) return s;
  if (/GANTUNG/.test(s)) return 'DIGANTUNG';
  if (/BATAL|BERHENTI/.test(s)) return 'DIBATALKAN';
  if (/TIDAK|TAK/.test(s)) return 'TIDAK AKTIF';
  return 'AKTIF';
}

function importDariSheetLama(idSheetLama, kodGelanggang) {
  if (!idSheetLama || !kodGelanggang) throw new Error('Isi IMPORT_ID_SHEET_LAMA dan IMPORT_KOD_GELANGGANG dahulu.');
  var g = cariSatu_('GELANGGANG', 'KOD', kodSemasa_(String(kodGelanggang).trim().toUpperCase()));
  if (!g) throw new Error('Gelanggang ' + kodGelanggang + ' tiada dalam Pusat. Daftar & luluskan dahulu.');
  var lama = SpreadsheetApp.openById(idSheetLama); // BACA SAHAJA — tiada tulisan ke sheet lama
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  var hasil = { ahliBaru: 0, ahliDikemaskini: 0, ahliSama: 0, ahliDilangkau: 0, yuranBaru: 0, yuranSediaAda: 0 };
  try {
    var ahliLama = bacaLama_(lama, 'AHLI');
    ahliLama.forEach(function (r) {
      var kp = bersihKP_(r.NO_KP);
      if (!kp || !r.NAMA_PENUH) { hasil.ahliDilangkau++; return; }
      var st = statusLama_(r.STATUS);
      var a = cariSatu_('AHLI', 'NO_KP', kp);
      if (a) {
        var ada = baca_('KEAHLIAN_GELANGGANG').some(function (k) { return k.NO_KP === kp && k.KOD_GELANGGANG === g.KOD; });
        if (!ada) daftarAhliTeras_(g, { no_kp: kp }, 'bersama', 'IMPORT');
        // Kemas kini maklumat hanya jika Seri Mutiara ialah gelanggang utama ahli ini
        if (a.GELANGGANG_UTAMA !== g.KOD) { hasil.ahliSama++; return; }
        var baru = { NAMA: String(r.NAMA_PENUH).trim().toUpperCase(), JANTINA: jantina_(r.JANTINA), TARIKH_LAHIR: tarikh_(r.TARIKH_LAHIR),
          BENGKUNG: String(r.BENGKUNG_SEMASA || ''), TEL_WARIS: String(r.NO_TEL_WARIS || ''), STATUS: st, ID_LAMA: String(r.ID_AHLI || a.ID_LAMA) };
        var ubah = {};
        Object.keys(baru).forEach(function (k) { if (baru[k] && baru[k] !== a[k]) ubah[k] = baru[k]; });
        if (Object.keys(ubah).length) {
          kemaskini_('AHLI', a._r, ubah);
          if (ubah.STATUS) {
            var k = baca_('KEAHLIAN_GELANGGANG').filter(function (x) { return x.NO_KP === kp && x.KOD_GELANGGANG === g.KOD && x.STATUS !== 'BERPINDAH'; })[0];
            if (k) kemaskini_('KEAHLIAN_GELANGGANG', k._r, { STATUS: st });
          }
          hasil.ahliDikemaskini++;
        } else hasil.ahliSama++;
        return;
      }
      daftarAhliTeras_(g, { no_kp: kp, nama: r.NAMA_PENUH, jantina: jantina_(r.JANTINA), tarikh_lahir: tarikh_(r.TARIKH_LAHIR),
        bengkung: r.BENGKUNG_SEMASA, tel_waris: r.NO_TEL_WARIS, tarikh_daftar: tarikh_(r.TARIKH_DAFTAR) || hariIni_(),
        status: st, id_lama: r.ID_AHLI }, '', 'IMPORT');
      if (st !== 'AKTIF') {
        var k2 = baca_('KEAHLIAN_GELANGGANG').filter(function (x) { return x.NO_KP === kp && x.KOD_GELANGGANG === g.KOD; })[0];
        if (k2) kemaskini_('KEAHLIAN_GELANGGANG', k2._r, { STATUS: st });
      }
      hasil.ahliBaru++;
    });
    var yuranLama = bacaLama_(lama, 'YURAN');
    yuranLama.forEach(function (r) {
      if (String(r.JENIS_YURAN).toUpperCase().indexOf('TAHUNAN') < 0) return;
      if (/TOLAK|BATAL/i.test(r.STATUS_PENGESAHAN || '')) return;
      var kp = bersihKP_(r.NO_KP), tahun = String(r.TAHUN || '').replace(/\D/g, '').slice(0, 4);
      if (!kp || !tahun || !cariSatu_('AHLI', 'NO_KP', kp)) return;
      var ada = baca_('YURAN_TAHUNAN').some(function (y) { return y.NO_KP === kp && y.TAHUN === tahun; });
      if (ada) { hasil.yuranSediaAda++; return; }
      tambah_('YURAN_TAHUNAN', { NO_KP: kp, KOD_GELANGGANG: g.KOD, TAHUN: tahun, JUMLAH: String(r.JUMLAH_BAYARAN || '').replace(/[^\d.]/g, ''),
        TARIKH_BAYAR: tarikh_(r.TARIKH_BAYAR), DIREKOD_OLEH: 'IMPORT' });
      hasil.yuranBaru++;
    });
    if (hasil.ahliBaru || hasil.ahliDikemaskini || hasil.yuranBaru) {
      log_('IMPORT', 'SEGERAK_GELANGGANG', g.KOD + ' ' + JSON.stringify(hasil));
      catatAktiviti_(g.KOD);
      naikVersi_();
    }
    PropertiesService.getScriptProperties().setProperty('SEGERAK_TERAKHIR', masa_());
  } finally { SpreadsheetApp.flush(); lock.releaseLock(); }
  return hasil;
}
function bacaLama_(ss, nama) {
  var sh = ss.getSheetByName(nama); if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getDataRange().getValues(), h = v[0].map(function (x) { return String(x).trim().toUpperCase(); }), out = [];
  for (var i = 1; i < v.length; i++) {
    var o = {}; for (var j = 0; j < h.length; j++) o[h[j]] = v[i][j] instanceof Date ? v[i][j] : String(v[i][j]).trim();
    out.push(o);
  }
  return out;
}
function tarikh_(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Kuala_Lumpur', 'yyyy-MM-dd');
  var s = String(v).trim(), m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}
function jantina_(v) { var s = String(v || '').toUpperCase(); return /^P|PEREMPUAN|^F/.test(s) ? 'P' : (s ? 'L' : ''); }

/* ======================= MODUL GELANGGANG (JURULATIH SAHAJA) =======================
 * Kehadiran, yuran bulanan, kewangan & fizikal/BMI adalah data dalaman gelanggang.
 * Super Admin & Admin Negeri TIDAK boleh baca data ini. */
function gelJur_(u) {
  if (u.PERANAN !== 'JURULATIH') throw new Error('Modul ini untuk jurulatih gelanggang sahaja.');
  var g = cariSatu_('GELANGGANG', 'KOD', u.KOD_GELANGGANG);
  if (!g || g.STATUS !== 'AKTIF') throw new Error('Gelanggang tidak aktif.');
  return g;
}
function ahliGel_(kod) {
  var set = {};
  baca_('KEAHLIAN_GELANGGANG').forEach(function (k) { if (k.KOD_GELANGGANG === kod && k.STATUS !== 'BERPINDAH') set[k.NO_KP] = k.STATUS; });
  return set;
}
function nombor_(v) { var n = parseFloat(String(v || '').replace(/[^\d.\-]/g, '')); return isNaN(n) ? 0 : n; }
function padamBaris_(n, r) { sh_(n).deleteRow(r); delete _tbl[n]; }

/* ---------- Kehadiran ---------- */
API.hadir_get = function (u, p) {
  var g = gelJur_(u), t = p.tarikh || hariIni_(), cw = p.cawangan || '';
  var rec = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH === t && (x.CAWANGAN || '') === cw; })[0];
  return { ok: true, tarikh: t, ada: !!rec, hadir: rec && rec.HADIR ? rec.HADIR.split(',') : [], catatan: rec ? rec.CATATAN : '' };
};
API.hadir_simpan = function (u, p) {
  var g = gelJur_(u), t = String(p.tarikh || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return { ok: false, msg: 'Tarikh tidak sah.' };
  var sah = ahliGel_(g.KOD), senarai = (p.hadir || []).filter(function (kp) { return sah[kp]; });
  var cw = p.cawangan || '';
  var o = { TARIKH: t, KOD_GELANGGANG: g.KOD, HADIR: senarai.join(','), BIL_HADIR: String(senarai.length), CATATAN: p.catatan || '', DIREKOD_OLEH: u.ID, CAWANGAN: cw };
  var rec = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH === t && (x.CAWANGAN || '') === cw; })[0];
  if (rec) kemaskini_('KEHADIRAN', rec._r, o); else tambah_('KEHADIRAN', o);
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Kehadiran ' + t + ' disimpan: ' + senarai.length + ' hadir.' };
};
API.hadir_laporan = function (u, p) {
  var g = gelJur_(u), pre = String(p.tahun) + '-' + ('0' + p.bulan).slice(-2);
  var sesi = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH.indexOf(pre) === 0 && (!p.cawangan || (x.CAWANGAN || '') === p.cawangan); });
  var bil = {};
  sesi.forEach(function (x) { (x.HADIR ? x.HADIR.split(',') : []).forEach(function (kp) { bil[kp] = (bil[kp] || 0) + 1; }); });
  return { ok: true, sesi: sesi.map(function (x) { return { tarikh: x.TARIKH, bil: Number(x.BIL_HADIR || 0) }; }).sort(function (a, b) { return a.tarikh.localeCompare(b.tarikh); }), bil: bil };
};

/* ---------- Yuran bulanan ---------- */
API.yb_get = function (u, p) {
  var g = gelJur_(u), th = String(p.tahun);
  return { ok: true, bayaran: baca_('YURAN_BULANAN').filter(function (y) { return y.KOD_GELANGGANG === g.KOD && y.TAHUN === th; })
    .map(function (y) { return { no_kp: y.NO_KP, bulan: Number(y.BULAN), jumlah: y.JUMLAH, tarikh: y.TARIKH_BAYAR, kaedah: y.KAEDAH }; }) };
};
/* ---------- Pengecualian yuran ----------
 * JENIS BULAN: seluruh gelanggang tiada yuran bulan itu (cuti). MULA = TAMAT = 'yyyy-MM'
 * JENIS AHLI : pesilat dikecualikan dari MULA hingga TAMAT ('yyyy-MM'; TAMAT kosong = berterusan) */
API.kec_get = function (u) {
  var g = gelJur_(u);
  return { ok: true, senarai: baca_('PENGECUALIAN').filter(function (k) { return k.KOD_GELANGGANG === g.KOD; }).map(function (k) {
    return { id: k.ID, jenis: k.JENIS, no_kp: k.NO_KP, mula: k.MULA, tamat: k.TAMAT, sebab: k.SEBAB };
  }) };
};
API.kec_simpan = function (u, p) {
  var g = gelJur_(u), bln = /^\d{4}-\d{2}$/;
  if (['BULAN', 'AHLI'].indexOf(p.jenis) < 0) return { ok: false, msg: 'Jenis tidak sah.' };
  if (!bln.test(String(p.mula || ''))) return { ok: false, msg: 'Bulan mula tidak sah.' };
  if (p.tamat && (!bln.test(p.tamat) || p.tamat < p.mula)) return { ok: false, msg: 'Bulan tamat tidak sah.' };
  if (p.jenis === 'AHLI' && !ahliGel_(g.KOD)[p.no_kp]) return { ok: false, msg: 'Pilih ahli gelanggang ini.' };
  if (p.jenis === 'BULAN' && baca_('PENGECUALIAN').some(function (k) { return k.KOD_GELANGGANG === g.KOD && k.JENIS === 'BULAN' && k.MULA === p.mula; }))
    return { ok: false, msg: 'Bulan ini sudah dikecualikan.' };
  tambah_('PENGECUALIAN', { ID: 'E' + Date.now(), KOD_GELANGGANG: g.KOD, JENIS: p.jenis, NO_KP: p.jenis === 'AHLI' ? p.no_kp : '',
    MULA: p.mula, TAMAT: p.jenis === 'BULAN' ? p.mula : (p.tamat || ''), SEBAB: p.sebab || '', DIREKOD_OLEH: u.ID });
  return { ok: true, msg: 'Pengecualian disimpan.' };
};
API.kec_padam = function (u, p) {
  var g = gelJur_(u), k = cariSatu_('PENGECUALIAN', 'ID', p.id);
  if (!k || k.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Rekod tiada.' };
  padamBaris_('PENGECUALIAN', k._r);
  return { ok: true, msg: 'Pengecualian dibatalkan.' };
};

API.yb_simpan = function (u, p) {
  var g = gelJur_(u), th = String(p.tahun), bl = String(Number(p.bulan));
  if (!/^\d{4}$/.test(th) || !(Number(bl) >= 1 && Number(bl) <= 12)) return { ok: false, msg: 'Bulan/tahun tidak sah.' };
  if (!ahliGel_(g.KOD)[p.no_kp]) return { ok: false, msg: 'Ahli bukan dari gelanggang ini.' };
  var o = { NO_KP: p.no_kp, KOD_GELANGGANG: g.KOD, TAHUN: th, BULAN: bl, JUMLAH: String(nombor_(p.jumlah)), TARIKH_BAYAR: p.tarikh || hariIni_(), KAEDAH: p.kaedah || 'TUNAI', DIREKOD_OLEH: u.ID };
  var ada = baca_('YURAN_BULANAN').filter(function (y) { return y.KOD_GELANGGANG === g.KOD && y.NO_KP === p.no_kp && y.TAHUN === th && y.BULAN === bl; })[0];
  if (ada) kemaskini_('YURAN_BULANAN', ada._r, o); else tambah_('YURAN_BULANAN', o);
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Yuran bulan ' + bl + '/' + th + ' direkod.' };
};
API.yb_padam = function (u, p) {
  var g = gelJur_(u), th = String(p.tahun), bl = String(Number(p.bulan));
  var ada = baca_('YURAN_BULANAN').filter(function (y) { return y.KOD_GELANGGANG === g.KOD && y.NO_KP === p.no_kp && y.TAHUN === th && y.BULAN === bl; })[0];
  if (!ada) return { ok: false, msg: 'Rekod tiada.' };
  padamBaris_('YURAN_BULANAN', ada._r);
  return { ok: true, msg: 'Rekod yuran dipadam.' };
};

/* ---------- Kewangan ---------- */
API.kew_get = function (u, p) {
  var g = gelJur_(u), th = String(p.tahun);
  var rekod = baca_('KEWANGAN').filter(function (k) { return k.KOD_GELANGGANG === g.KOD && k.TARIKH.indexOf(th) === 0; })
    .map(function (k) { return { id: k.ID, tarikh: k.TARIKH, jenis: k.JENIS, kategori: k.KATEGORI, keterangan: k.KETERANGAN, jumlah: nombor_(k.JUMLAH) }; });
  var yb = Array(13).fill(0), yt = 0;
  baca_('YURAN_BULANAN').forEach(function (y) { if (y.KOD_GELANGGANG === g.KOD && y.TAHUN === th) yb[Number(y.BULAN)] += nombor_(y.JUMLAH); });
  baca_('YURAN_TAHUNAN').forEach(function (y) { if (y.KOD_GELANGGANG === g.KOD && y.TAHUN === th) yt += nombor_(y.JUMLAH); });
  var bakiLalu = 0;
  baca_('KEWANGAN').forEach(function (k) { if (k.KOD_GELANGGANG === g.KOD && k.TARIKH < th) bakiLalu += (k.JENIS === 'KELUAR' ? -1 : 1) * nombor_(k.JUMLAH); });
  baca_('YURAN_BULANAN').forEach(function (y) { if (y.KOD_GELANGGANG === g.KOD && y.TAHUN < th) bakiLalu += nombor_(y.JUMLAH); });
  baca_('YURAN_TAHUNAN').forEach(function (y) { if (y.KOD_GELANGGANG === g.KOD && y.TAHUN < th) bakiLalu += nombor_(y.JUMLAH); });
  rekod.sort(function (a, b) { return b.tarikh.localeCompare(a.tarikh); });
  return { ok: true, rekod: rekod, yuranBulanan: yb, yuranTahunan: yt, bakiLalu: bakiLalu };
};
API.kew_simpan = function (u, p) {
  var g = gelJur_(u);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.tarikh || ''))) return { ok: false, msg: 'Tarikh tidak sah.' };
  if (['MASUK', 'KELUAR'].indexOf(p.jenis) < 0) return { ok: false, msg: 'Pilih Masuk atau Keluar.' };
  if (!(nombor_(p.jumlah) > 0)) return { ok: false, msg: 'Jumlah mesti lebih dari 0.' };
  tambah_('KEWANGAN', { ID: 'K' + Date.now(), KOD_GELANGGANG: g.KOD, TARIKH: p.tarikh, JENIS: p.jenis, KATEGORI: p.kategori || '',
    KETERANGAN: p.keterangan || '', JUMLAH: String(nombor_(p.jumlah)), DIREKOD_OLEH: u.ID });
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Rekod kewangan disimpan.' };
};
API.kew_padam = function (u, p) {
  var g = gelJur_(u), k = cariSatu_('KEWANGAN', 'ID', p.id);
  if (!k || k.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Rekod tiada.' };
  padamBaris_('KEWANGAN', k._r);
  return { ok: true, msg: 'Rekod dipadam.' };
};

/* ---------- Fizikal & BMI ---------- */
API.fiz_get = function (u) {
  var g = gelJur_(u);
  return { ok: true, rekod: baca_('FIZIKAL').filter(function (f) { return f.KOD_GELANGGANG === g.KOD; }).map(function (f) {
    return { id: f.ID, no_kp: f.NO_KP, tarikh: f.TARIKH, berat: f.BERAT, tinggi: f.TINGGI, bmi: f.BMI, tekan: f.TEKAN_TUBI,
      bangkit: f.BANGKIT_TUBI, lari: f.LARI, catatan: f.CATATAN };
  }).sort(function (a, b) { return b.tarikh.localeCompare(a.tarikh); }) };
};
API.fiz_simpan = function (u, p) {
  var g = gelJur_(u);
  if (!ahliGel_(g.KOD)[p.no_kp]) return { ok: false, msg: 'Pilih ahli gelanggang ini.' };
  var b = nombor_(p.berat), t = nombor_(p.tinggi);
  var bmi = b > 0 && t > 0 ? (b / Math.pow(t / 100, 2)).toFixed(1) : '';
  tambah_('FIZIKAL', { ID: 'F' + Date.now(), NO_KP: p.no_kp, KOD_GELANGGANG: g.KOD, TARIKH: p.tarikh || hariIni_(), BERAT: b ? String(b) : '',
    TINGGI: t ? String(t) : '', BMI: bmi, TEKAN_TUBI: p.tekan || '', BANGKIT_TUBI: p.bangkit || '', LARI: p.lari || '', CATATAN: p.catatan || '', DIREKOD_OLEH: u.ID });
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Rekod fizikal disimpan' + (bmi ? ' (BMI ' + bmi + ').' : '.') };
};
API.fiz_padam = function (u, p) {
  var g = gelJur_(u), f = cariSatu_('FIZIKAL', 'ID', p.id);
  if (!f || f.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Rekod tiada.' };
  padamBaris_('FIZIKAL', f._r);
  return { ok: true, msg: 'Rekod dipadam.' };
};

/* ======================= PORTAL IBU BAPA =======================
 * Log masuk tanpa akaun: No. KP anak + No. telefon waris (seperti dalam rekod ahli).
 * Dihadkan 5 cubaan gagal / 15 minit bagi setiap No. KP. Hanya data anak itu dipulangkan. */
function digitTel_(t) { var d = String(t || '').replace(/\D/g, ''); return d.slice(-9); }
AWAM_FN.ibubapa = function (p) {
  var kp = bersihKP_(p.no_kp), c = CacheService.getScriptCache(), kunci = 'ib_' + kp.replace(/\D/g, '');
  var gagal = Number(c.get(kunci) || 0);
  if (gagal >= 5) return { ok: false, msg: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.' };
  var a = cariSatu_('AHLI', 'NO_KP', kp), t = digitTel_(p.telefon);
  if (!a || t.length < 8 || digitTel_(a.TEL_WARIS) !== t) {
    c.put(kunci, String(gagal + 1), 900);
    return { ok: false, msg: 'No. KP atau no. telefon waris tidak sepadan dengan rekod gelanggang.' };
  }
  c.remove(kunci);
  var g = cariSatu_('GELANGGANG', 'KOD', a.GELANGGANG_UTAMA) || {};
  var ketua = g.KETUA_ID ? cariSatu_('PENGGUNA', 'ID', g.KETUA_ID) : null;
  var kini = new Date(), th = String(kini.getFullYear());
  // Kehadiran 4 bulan terakhir
  var bulanList = [];
  for (var i = 0; i < 4; i++) { var d = new Date(kini.getFullYear(), kini.getMonth() - i, 1); bulanList.push(Utilities.formatDate(d, 'Asia/Kuala_Lumpur', 'yyyy-MM')); }
  var kAnak = baca_('KEAHLIAN_GELANGGANG').filter(function (k) { return k.NO_KP === kp && k.KOD_GELANGGANG === g.KOD; })[0];
  var cwAnak = kAnak ? (kAnak.CAWANGAN || '') : '';
  var cwRec = cwAnak ? cariSatu_('CAWANGAN', 'ID', cwAnak) : null;
  var hadir = bulanList.map(function (ym) {
    var sesi = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH.indexOf(ym) === 0 && (!x.CAWANGAN || x.CAWANGAN === cwAnak || (x.HADIR || '').split(',').indexOf(kp) >= 0); });
    var tarikh = sesi.filter(function (x) { return (x.HADIR || '').split(',').indexOf(kp) >= 0; }).map(function (x) { return x.TARIKH; }).sort();
    return { bulan: ym, sesi: sesi.length, hadir: tarikh.length, tarikh: tarikh };
  });
  var yb = baca_('YURAN_BULANAN').filter(function (y) { return y.NO_KP === kp && y.TAHUN === th; })
    .map(function (y) { return { bulan: Number(y.BULAN), jumlah: y.JUMLAH, tarikh: y.TARIKH_BAYAR, kaedah: y.KAEDAH }; });
  var kec = baca_('PENGECUALIAN').filter(function (k) { return k.KOD_GELANGGANG === g.KOD && (k.JENIS === 'BULAN' || k.NO_KP === kp); })
    .map(function (k) { return { jenis: k.JENIS, mula: k.MULA, tamat: k.TAMAT, sebab: k.SEBAB }; });
  var yt = baca_('YURAN_TAHUNAN').filter(function (y) { return y.NO_KP === kp; }).map(function (y) { return { tahun: y.TAHUN, jumlah: y.JUMLAH, tarikh: y.TARIKH_BAYAR }; });
  var fiz = baca_('FIZIKAL').filter(function (f) { return f.NO_KP === kp; }).sort(function (x, y) { return y.TARIKH.localeCompare(x.TARIKH); })
    .slice(0, 6).map(function (f) { return { tarikh: f.TARIKH, berat: f.BERAT, tinggi: f.TINGGI, bmi: f.BMI }; });
  return { ok: true, anak: { nama: a.NAMA, no_ahli: a.NO_AHLI, no_kp: topengKP_(a.NO_KP), jantina: a.JANTINA, tarikh_lahir: a.TARIKH_LAHIR,
      bengkung: a.BENGKUNG, status: a.STATUS, tarikh_daftar: a.TARIKH_DAFTAR },
    gelanggang: { nama: g.NAMA || '', kod: g.KOD || '', logo: g.LOGO || '', cawangan: cwRec ? cwRec.NAMA : '', negeri: namaNegeri_(g.NEGERI), ketua: ketua ? ketua.NAMA : '', telKetua: ketua ? ketua.TELEFON : '' },
    bayar: g.QR_BAYAR ? { qr: g.QR_BAYAR, info: infoBayar_(g), dikemaskini: g.QR_DIKEMASKINI || '' } : null,
    notis: baca_('BAYARAN_NOTIS').filter(function (n) { return n.NO_KP === kp && n.KOD_GELANGGANG === g.KOD; }).slice(-5).reverse()
      .map(function (n) { return { tarikh: n.TARIKH_HANTAR, jenis: n.JENIS, tahun: n.TAHUN, bulan: n.BULAN, jumlah: n.JUMLAH, status: n.STATUS }; }),
    jadual: g.KOD ? jadualGel_(g.KOD).filter(function (j) { return !j.cawangan || j.cawangan === cwAnak; }) : [],
    tahun: th, hadir: hadir, yuranBulanan: yb, pengecualian: kec, yuranTahunan: yt, fizikal: fiz };
};

/* ======================= CAWANGAN (lokasi latihan di bawah gelanggang induk) ======================= */
API.caw_get = function (u) {
  var g = gelJur_(u), bil = {};
  baca_('KEAHLIAN_GELANGGANG').forEach(function (k) { if (k.KOD_GELANGGANG === g.KOD && k.STATUS === 'AKTIF' && k.CAWANGAN) bil[k.CAWANGAN] = (bil[k.CAWANGAN] || 0) + 1; });
  return { ok: true, cawangan: baca_('CAWANGAN').filter(function (c) { return c.KOD_GELANGGANG === g.KOD && c.STATUS !== 'PADAM'; })
    .map(function (c) { return { id: c.ID, nama: c.NAMA, alamat: c.ALAMAT, bil: bil[c.ID] || 0 }; }) };
};
API.caw_simpan = function (u, p) {
  var g = gelJur_(u), nama = String(p.nama || '').trim();
  if (!nama) return { ok: false, msg: 'Nama cawangan wajib.' };
  if (p.id) {
    var c = cariSatu_('CAWANGAN', 'ID', p.id);
    if (!c || c.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Cawangan tiada.' };
    kemaskini_('CAWANGAN', c._r, { NAMA: nama, ALAMAT: p.alamat || '' });
    return { ok: true, msg: 'Cawangan dikemas kini.' };
  }
  tambah_('CAWANGAN', { ID: 'C' + Date.now(), KOD_GELANGGANG: g.KOD, NAMA: nama, ALAMAT: p.alamat || '', STATUS: 'AKTIF', TARIKH_DAFTAR: hariIni_() });
  log_(u.ID, 'TAMBAH_CAWANGAN', g.KOD + ' ' + nama);
  return { ok: true, msg: 'Cawangan "' + nama + '" ditambah.' };
};
API.caw_padam = function (u, p) {
  var g = gelJur_(u), c = cariSatu_('CAWANGAN', 'ID', p.id);
  if (!c || c.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Cawangan tiada.' };
  kemaskini_('CAWANGAN', c._r, { STATUS: 'PADAM' });
  baca_('KEAHLIAN_GELANGGANG').forEach(function (k) { if (k.KOD_GELANGGANG === g.KOD && k.CAWANGAN === c.ID) kemaskini_('KEAHLIAN_GELANGGANG', k._r, { CAWANGAN: '' }); });
  return { ok: true, msg: 'Cawangan dipadam. Ahlinya kini tanpa cawangan.' };
};
API.caw_tag = function (u, p) {
  // p.tag = { no_kp: idCawangan('' = tiada) }
  var g = gelJur_(u), tag = p.tag || {}, n = 0;
  var sah = {}; baca_('CAWANGAN').forEach(function (c) { if (c.KOD_GELANGGANG === g.KOD && c.STATUS !== 'PADAM') sah[c.ID] = 1; });
  baca_('KEAHLIAN_GELANGGANG').forEach(function (k) {
    if (k.KOD_GELANGGANG !== g.KOD || !(k.NO_KP in tag) || k.STATUS === 'BERPINDAH') return;
    var cw = tag[k.NO_KP] || ''; if (cw && !sah[cw]) return;
    if ((k.CAWANGAN || '') !== cw) { kemaskini_('KEAHLIAN_GELANGGANG', k._r, { CAWANGAN: cw }); n++; }
  });
  return { ok: true, msg: n + ' ahli dikemas kini.' };
};

/* ======================= LOGO GELANGGANG =======================
 * Gambar dikecilkan di telefon (≤ 256px) dan disimpan sebagai teks data:image dalam sheet GELANGGANG (had sel 50,000 aksara). */
API.logo_simpan = function (u, p) {
  var g = gelJur_(u), d = String(p.data || '');
  if (d && !/^data:image\/(png|jpeg|webp);base64,/.test(d)) return { ok: false, msg: 'Jenis fail tidak sah.' };
  if (d.length > 48000) return { ok: false, msg: 'Gambar masih terlalu besar selepas dikecilkan. Cuba gambar lain.' };
  kemaskini_('GELANGGANG', g._r, { LOGO: d });
  log_(u.ID, 'LOGO_GELANGGANG', g.KOD + (d ? ' dikemas kini' : ' dibuang'));
  return { ok: true, msg: d ? 'Logo gelanggang disimpan.' : 'Logo dibuang. Logo persatuan digunakan.' };
};

/* ======================= RESET KATA LALUAN (Super Admin) =======================
 * Kata laluan asal TIDAK boleh dilihat (disimpan sebagai hash). Super Admin jana kata laluan sementara;
 * pengguna wajib tukar selepas log masuk. Semua sesi lama pengguna itu dibatalkan. */
API.reset_katalaluan = function (u, p) {
  wajib_(u, ['SUPER_ADMIN']);
  var x = cariSatu_('PENGGUNA', 'ID', p.id);
  if (!x) return { ok: false, msg: 'Pengguna tidak dijumpai.' };
  if (x.ID === u.ID) return { ok: false, msg: 'Untuk akaun sendiri, guna menu Akaun → Tukar Kata Laluan.' };
  var huruf = 'ABCDEFGHJKLMNPQRSTUVWXYZ', sem = 'SG';
  for (var i = 0; i < 2; i++) sem += huruf.charAt(Math.floor(Math.random() * huruf.length));
  for (var j = 0; j < 4; j++) sem += Math.floor(Math.random() * 10);
  var salt = Utilities.getUuid();
  kemaskini_('PENGGUNA', x._r, { HASH: hash_(sem, salt), SALT: salt, GAGAL: '0', KUNCI_HINGGA: '', WAJIB_TUKAR: 'YA' });
  var sh = sh_('SESI'), rs = baca_('SESI'), c = CacheService.getScriptCache();
  for (var k = rs.length - 1; k >= 0; k--) if (rs[k].ID === x.ID) { c.remove('t_' + rs[k].TOKEN); sh.deleteRow(rs[k]._r); }
  delete _tbl.SESI;
  log_(u.ID, 'RESET_KATALALUAN', x.ID);
  return { ok: true, sementara: sem, nama: x.NAMA, id: x.ID, telefon: x.TELEFON };
};

/* ======================= TUKAR KOD GELANGGANG (ketua jurulatih) =======================
 * Kod baharu 3 huruf, unik dalam negeri. Semua rujukan dalam setiap sheet dikemas kini serentak.
 * No. ahli sedia ada KEKAL (seumur hidup); ahli baharu menerima nombor dengan kod baharu.
 * Kod lama disimpan sebagai alias supaya segerak sistem lama & pautan lama masih berfungsi. */
var LAJUR_KOD = [['GELANGGANG', 'KOD'], ['PENGGUNA', 'KOD_GELANGGANG'], ['AHLI', 'GELANGGANG_UTAMA'], ['KEAHLIAN_GELANGGANG', 'KOD_GELANGGANG'],
  ['YURAN_TAHUNAN', 'KOD_GELANGGANG'], ['YURAN_BULANAN', 'KOD_GELANGGANG'], ['KEHADIRAN', 'KOD_GELANGGANG'], ['KEWANGAN', 'KOD_GELANGGANG'],
  ['FIZIKAL', 'KOD_GELANGGANG'], ['PENGECUALIAN', 'KOD_GELANGGANG'], ['CAWANGAN', 'KOD_GELANGGANG'], ['JADUAL_LATIHAN', 'KOD_GELANGGANG']];
function kodSemasa_(kod) {
  var pr = PropertiesService.getScriptProperties(), k = kod, n = 0;
  while (n++ < 10) { var a = pr.getProperty('ALIAS_' + k); if (!a) break; k = a; }
  return k;
}
function kodDipakai_(kod) {
  if (cariSatu_('GELANGGANG', 'KOD', kod)) return true;
  if (PropertiesService.getScriptProperties().getProperty('ALIAS_' + kod)) return true;
  return baca_('AHLI').some(function (a) { return a.NO_AHLI.indexOf(kod + '-') === 0; });
}
API.tukar_kod = function (u, p) {
  var g = gelJur_(u);
  if (u.KETUA !== 'YA') return { ok: false, msg: 'Hanya ketua jurulatih gelanggang boleh menukar kod.' };
  var k3 = String(p.kod3 || '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(k3)) return { ok: false, msg: 'Kod mesti tepat 3 huruf (A–Z), cth. TPG.' };
  var lama = g.KOD, baru = g.NEGERI + '-' + k3;
  if (baru === lama) return { ok: false, msg: 'Kod sama dengan kod semasa.' };
  if (kodDipakai_(baru)) return { ok: false, msg: 'Kod ' + baru + ' sudah atau pernah digunakan. Pilih kod lain.' };
  var jumlah = 0;
  LAJUR_KOD.forEach(function (lk) {
    var sh = sh_(lk[0]); if (!sh || sh.getLastRow() < 2) return;
    var c = JADUAL[lk[0]].indexOf(lk[1]) + 1, r = sh.getRange(2, c, sh.getLastRow() - 1, 1), v = r.getDisplayValues(), ubah = false;
    for (var i = 0; i < v.length; i++) if (String(v[i][0]).trim() === lama) { v[i][0] = baru; ubah = true; jumlah++; }
    if (ubah) r.setNumberFormat('@').setValues(v);
    delete _tbl[lk[0]];
  });
  PropertiesService.getScriptProperties().setProperty('ALIAS_' + lama, baru);
  log_(u.ID, 'TUKAR_KOD', lama + ' → ' + baru + ' (' + jumlah + ' rujukan)');
  return { ok: true, kod: baru, msg: 'Kod gelanggang ditukar: ' + lama + ' → ' + baru + '. No. ahli sedia ada kekal.' };
};

/* ======================= JADUAL LATIHAN ======================= */
var HARI_ = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU', 'AHAD'];
function jadualGel_(kod) {
  var caw = {}; baca_('CAWANGAN').forEach(function (c) { caw[c.ID] = c.NAMA; });
  return baca_('JADUAL_LATIHAN').filter(function (j) { return j.KOD_GELANGGANG === kod; }).map(function (j) {
    return { id: j.ID, cawangan: j.CAWANGAN, nama_cawangan: caw[j.CAWANGAN] || '', hari: j.HARI, mula: j.MULA, tamat: j.TAMAT, lokasi: j.LOKASI, catatan: j.CATATAN };
  }).sort(function (a, b) { return (HARI_.indexOf(a.hari) - HARI_.indexOf(b.hari)) || a.mula.localeCompare(b.mula); });
}
API.jad_get = function (u) { var g = gelJur_(u); return { ok: true, jadual: jadualGel_(g.KOD) }; };
API.jad_simpan = function (u, p) {
  var g = gelJur_(u), hari = String(p.hari || '').toUpperCase(), jm = /^\d{2}:\d{2}$/;
  if (HARI_.indexOf(hari) < 0) return { ok: false, msg: 'Pilih hari.' };
  if (!jm.test(p.mula || '') || !jm.test(p.tamat || '')) return { ok: false, msg: 'Isi masa mula & tamat.' };
  if (p.tamat <= p.mula) return { ok: false, msg: 'Masa tamat mesti selepas masa mula.' };
  var o = { KOD_GELANGGANG: g.KOD, CAWANGAN: p.cawangan || '', HARI: hari, MULA: p.mula, TAMAT: p.tamat, LOKASI: p.lokasi || '', CATATAN: p.catatan || '' };
  if (p.id) {
    var j = cariSatu_('JADUAL_LATIHAN', 'ID', p.id);
    if (!j || j.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Jadual tiada.' };
    kemaskini_('JADUAL_LATIHAN', j._r, o);
  } else { o.ID = 'J' + Date.now(); tambah_('JADUAL_LATIHAN', o); }
  return { ok: true, msg: 'Jadual latihan disimpan.' };
};
API.jad_padam = function (u, p) {
  var g = gelJur_(u), j = cariSatu_('JADUAL_LATIHAN', 'ID', p.id);
  if (!j || j.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Jadual tiada.' };
  padamBaris_('JADUAL_LATIHAN', j._r);
  return { ok: true, msg: 'Slot latihan dipadam.' };
};

/* ======================= BORANG PENDAFTARAN ONLINE (awam) =======================
 * Link: daftar.html?g=KOD-GELANGGANG  (pilihan: &c=ID-CAWANGAN)
 * Permohonan masuk ke sheet PERMOHONAN berstatus MENUNGGU; jurulatih gelanggang itu luluskan / tolak.
 * Bawah 18 tahun: maklumat waris & kebenaran ibu bapa WAJIB. Akuan adat & adab perguruan WAJIB untuk semua. */
function gelAwam_(kod) {
  var g = cariSatu_('GELANGGANG', 'KOD', kodSemasa_(String(kod || '').trim().toUpperCase()));
  return g && g.STATUS === 'AKTIF' ? g : null;
}
function umurDari_(tarikhLahir, kp) {
  var y = Number(String(tarikhLahir || '').slice(0, 4)), m = Number(String(tarikhLahir || '').slice(5, 7)), d = Number(String(tarikhLahir || '').slice(8, 10));
  if (!y) { var x = String(kp || '').replace(/\D/g, ''); if (x.length < 6) return null; y = Number(x.slice(0, 2)); y += y > new Date().getFullYear() % 100 ? 1900 : 2000; m = Number(x.slice(2, 4)); d = Number(x.slice(4, 6)); }
  var k = new Date(), u = k.getFullYear() - y;
  if (k.getMonth() + 1 < m || (k.getMonth() + 1 === m && k.getDate() < d)) u--;
  return u;
}
AWAM_FN.borang_info = function (p) {
  var g = gelAwam_(p.g);
  if (!g) return { ok: false, msg: 'Pautan borang tidak sah atau gelanggang tidak aktif.' };
  var k = g.KETUA_ID ? cariSatu_('PENGGUNA', 'ID', g.KETUA_ID) : null;
  return { ok: true, gelanggang: { kod: g.KOD, nama: g.NAMA, negeri: namaNegeri_(g.NEGERI), alamat: g.ALAMAT, logo: g.LOGO || '', ketua: k ? k.NAMA : '' },
    cawangan: baca_('CAWANGAN').filter(function (c) { return c.KOD_GELANGGANG === g.KOD && c.STATUS !== 'PADAM'; }).map(function (c) { return { id: c.ID, nama: c.NAMA }; }),
    jadual: jadualGel_(g.KOD) };
};
AWAM_FN.borang_hantar = function (p) {
  var g = gelAwam_(p.g); if (!g) return { ok: false, msg: 'Gelanggang tidak aktif.' };
  var d = p.data || {}, kp = bersihKP_(d.no_kp);
  if (String(kp).replace(/\D/g, '').length !== 12) return { ok: false, msg: 'No. KP / MyKid mesti 12 digit.' };
  if (!d.nama || !d.jantina || !d.tarikh_lahir) return { ok: false, msg: 'Sila lengkapkan nama, jantina dan tarikh lahir.' };
  if (!d.akur_adat) return { ok: false, msg: 'Sila tandakan akuan adat dan adab perguruan.' };
  if (!d.pdpa) return { ok: false, msg: 'Sila bersetuju dengan notis PDPA.' };
  var umur = umurDari_(d.tarikh_lahir, kp), bawah18 = umur == null || umur < 18;
  if (bawah18) {
    if (!d.nama_waris || !d.hubungan_waris || !d.tel_waris) return { ok: false, msg: 'Pemohon bawah 18 tahun: maklumat ibu bapa / penjaga wajib diisi.' };
    if (!d.kebenaran_waris) return { ok: false, msg: 'Pemohon bawah 18 tahun: kebenaran ibu bapa / penjaga wajib ditandakan.' };
  } else if (!d.tel_pesilat && !d.tel_waris) return { ok: false, msg: 'Sila isi no. telefon.' };
  var c = CacheService.getScriptCache(), kunci = 'bh_' + kp.replace(/\D/g, '');
  if (c.get(kunci)) return { ok: false, msg: 'Permohonan untuk No. KP ini baru sahaja dihantar. Sila tunggu.' };
  var ada = baca_('PERMOHONAN').some(function (x) { return x.NO_KP === kp && x.KOD_GELANGGANG === g.KOD && x.STATUS === 'MENUNGGU'; });
  if (ada) return { ok: false, msg: 'Permohonan untuk No. KP ini sedang menunggu kelulusan jurulatih.' };
  var sudah = baca_('KEAHLIAN_GELANGGANG').some(function (k) { return k.NO_KP === kp && k.KOD_GELANGGANG === g.KOD && k.STATUS === 'AKTIF'; });
  if (sudah) return { ok: false, msg: 'Pemohon ini sudah menjadi ahli aktif gelanggang ini.' };
  var caw = d.cawangan && baca_('CAWANGAN').some(function (x) { return x.ID === d.cawangan && x.KOD_GELANGGANG === g.KOD; }) ? d.cawangan : '';
  var t = masa_(), id = 'P' + Date.now(), pot = function (v, n) { return String(v || '').trim().slice(0, n || 200); };
  tambah_('PERMOHONAN', { ID: id, KOD_GELANGGANG: g.KOD, CAWANGAN: caw, TARIKH_MOHON: t, NO_KP: kp, NAMA: pot(d.nama, 120).toUpperCase(),
    JANTINA: d.jantina === 'P' ? 'P' : 'L', TARIKH_LAHIR: pot(d.tarikh_lahir, 10), ALAMAT: pot(d.alamat, 300), TEL_PESILAT: pot(d.tel_pesilat, 20),
    SEKOLAH_KERJA: pot(d.sekolah), NAMA_WARIS: pot(d.nama_waris, 120).toUpperCase(), HUBUNGAN_WARIS: pot(d.hubungan_waris, 30),
    NO_KP_WARIS: pot(d.no_kp_waris, 20), TEL_WARIS: pot(d.tel_waris, 20), EMEL_WARIS: pot(d.emel_waris, 120), KESIHATAN: pot(d.kesihatan, 300),
    KEBENARAN_WARIS: d.kebenaran_waris ? 'YA ' + t : (bawah18 ? '' : 'DEWASA'), AKUR_ADAT: 'YA ' + t, PDPA: 'YA ' + t,
    STATUS: 'MENUNGGU', SEBAB_TOLAK: '', DIPROSES_OLEH: '', TARIKH_PROSES: '', NO_AHLI: '' });
  c.put(kunci, '1', 120);
  log_('AWAM', 'PERMOHONAN_BARU', g.KOD + ' ' + id);
  return { ok: true, id: id, msg: 'Permohonan dihantar! Jurulatih ' + g.NAMA + ' akan menyemak dan meluluskannya.' };
};

/* ---------- Jurulatih: semak permohonan ---------- */
API.mohon_senarai = function (u) {
  var g = gelJur_(u), caw = {};
  baca_('CAWANGAN').forEach(function (c) { caw[c.ID] = c.NAMA; });
  var ahliKp = {}; baca_('AHLI').forEach(function (a) { ahliKp[a.NO_KP] = a; });
  return { ok: true, permohonan: baca_('PERMOHONAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD; }).map(function (x) {
    var a = ahliKp[x.NO_KP];
    return { id: x.ID, cawangan: x.CAWANGAN, nama_cawangan: caw[x.CAWANGAN] || '', tarikh: x.TARIKH_MOHON, no_kp: x.NO_KP, nama: x.NAMA, jantina: x.JANTINA,
      tarikh_lahir: x.TARIKH_LAHIR, umur: umurDari_(x.TARIKH_LAHIR, x.NO_KP), alamat: x.ALAMAT, tel_pesilat: x.TEL_PESILAT, sekolah: x.SEKOLAH_KERJA,
      nama_waris: x.NAMA_WARIS, hubungan_waris: x.HUBUNGAN_WARIS, no_kp_waris: x.NO_KP_WARIS, tel_waris: x.TEL_WARIS, emel_waris: x.EMEL_WARIS,
      kesihatan: x.KESIHATAN, kebenaran: x.KEBENARAN_WARIS, adat: x.AKUR_ADAT, status: x.STATUS, sebab: x.SEBAB_TOLAK, no_ahli: x.NO_AHLI,
      wujud: a ? { no_ahli: a.NO_AHLI, utama: a.GELANGGANG_UTAMA } : null };
  }).sort(function (a, b) { return b.tarikh.localeCompare(a.tarikh); }) };
};
API.mohon_lulus = function (u, p) {
  var g = gelJur_(u), x = cariSatu_('PERMOHONAN', 'ID', p.id);
  if (!x || x.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Permohonan tiada.' };
  if (x.STATUS !== 'MENUNGGU') return { ok: false, msg: 'Permohonan ini sudah diproses.' };
  var r = daftarAhliTeras_(g, { no_kp: x.NO_KP, nama: x.NAMA, jantina: x.JANTINA, tarikh_lahir: x.TARIKH_LAHIR, bengkung: p.bengkung || 'Hitam Kosong (Ahli Baharu)',
    tel_waris: x.TEL_WARIS || x.TEL_PESILAT, cawangan: p.cawangan != null ? p.cawangan : x.CAWANGAN }, p.mod || '', u.ID);
  if (!r.ok) return r;
  kemaskini_('PERMOHONAN', x._r, { STATUS: 'LULUS', DIPROSES_OLEH: u.ID, TARIKH_PROSES: masa_(), NO_AHLI: r.no_ahli || '' });
  catatAktiviti_(g.KOD);
  return { ok: true, no_ahli: r.no_ahli, msg: 'Diluluskan. ' + r.msg };
};
API.mohon_tolak = function (u, p) {
  var g = gelJur_(u), x = cariSatu_('PERMOHONAN', 'ID', p.id);
  if (!x || x.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Permohonan tiada.' };
  if (x.STATUS !== 'MENUNGGU') return { ok: false, msg: 'Permohonan ini sudah diproses.' };
  kemaskini_('PERMOHONAN', x._r, { STATUS: 'DITOLAK', SEBAB_TOLAK: p.sebab || '', DIPROSES_OLEH: u.ID, TARIKH_PROSES: masa_() });
  return { ok: true, msg: 'Permohonan ditolak.' };
};

/* ======================= QR BAYARAN YURAN =======================
 * Setiap gelanggang ada QR (DuitNow / bank) sendiri. Hanya KETUA jurulatih boleh tukar.
 * Setiap pertukaran dicatat dalam LOG_AUDIT dan tarikh pertukaran dipaparkan kepada ibu bapa (elak QR palsu senyap-senyap).
 * Ibu bapa hantar notis "sudah bayar" + resit; jurulatih sahkan → yuran direkod automatik. */
function infoBayar_(g) { try { return JSON.parse(g.INFO_BAYAR || '{}'); } catch (e) { return {}; } }
function gambarSah_(d, maks) { return !d || (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(d) && d.length <= (maks || 48000)); }
API.qr_get = function (u) {
  var g = gelJur_(u);
  return { ok: true, qr: g.QR_BAYAR || '', info: infoBayar_(g), dikemaskini: g.QR_DIKEMASKINI || '', bolehUbah: u.KETUA === 'YA' };
};
API.qr_simpan = function (u, p) {
  var g = gelJur_(u);
  if (u.KETUA !== 'YA') return { ok: false, msg: 'Hanya ketua jurulatih boleh menukar QR bayaran.' };
  if (!gambarSah_(p.qr)) return { ok: false, msg: 'Gambar QR tidak sah atau terlalu besar.' };
  var i = p.info || {}, pot = function (v, n) { return String(v || '').replace(/[<>]/g, '').trim().slice(0, n); };
  var info = { nama: pot(i.nama, 80), bank: pot(i.bank, 40), akaun: pot(i.akaun, 30), nota: pot(i.nota, 160) };
  if (p.qr && !info.nama) return { ok: false, msg: 'Nama penerima wajib diisi supaya ibu bapa boleh semak sebelum bayar.' };
  kemaskini_('GELANGGANG', g._r, { QR_BAYAR: p.qr || '', INFO_BAYAR: JSON.stringify(info), QR_DIKEMASKINI: masa_() });
  log_(u.ID, 'QR_BAYARAN', g.KOD + (p.qr ? ' dikemas kini → ' + info.nama + ' ' + info.bank : ' dibuang'));
  return { ok: true, msg: p.qr ? 'QR bayaran disimpan.' : 'QR bayaran dibuang.' };
};
AWAM_FN.ibubapa_bayar = function (p) {
  var kp = bersihKP_(p.no_kp), c = CacheService.getScriptCache(), kunci = 'ib_' + kp.replace(/\D/g, '');
  if (Number(c.get(kunci) || 0) >= 5) return { ok: false, msg: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.' };
  var a = cariSatu_('AHLI', 'NO_KP', kp), t = digitTel_(p.telefon);
  if (!a || t.length < 8 || digitTel_(a.TEL_WARIS) !== t) { c.put(kunci, String(Number(c.get(kunci) || 0) + 1), 900); return { ok: false, msg: 'Pengesahan gagal.' }; }
  if (c.get('ibn_' + kunci)) return { ok: false, msg: 'Notis baru sahaja dihantar. Tunggu sebentar.' };
  var g = cariSatu_('GELANGGANG', 'KOD', a.GELANGGANG_UTAMA); if (!g) return { ok: false, msg: 'Gelanggang tiada.' };
  var d = p.data || {}, jenis = d.jenis === 'TAHUNAN' ? 'TAHUNAN' : 'BULANAN', th = String(d.tahun || ''), bln = (d.bulan || []).map(Number).filter(function (m) { return m >= 1 && m <= 12; });
  if (!/^\d{4}$/.test(th)) return { ok: false, msg: 'Tahun tidak sah.' };
  if (jenis === 'BULANAN' && !bln.length) return { ok: false, msg: 'Pilih bulan yang dibayar.' };
  if (!(nombor_(d.jumlah) > 0)) return { ok: false, msg: 'Isi jumlah bayaran.' };
  if (!d.resit) return { ok: false, msg: 'Sila lampirkan resit / tangkap layar bayaran.' };
  if (!gambarSah_(d.resit)) return { ok: false, msg: 'Gambar resit tidak sah atau terlalu besar.' };
  tambah_('BAYARAN_NOTIS', { ID: 'B' + Date.now(), KOD_GELANGGANG: g.KOD, NO_KP: kp, TARIKH_HANTAR: masa_(), JENIS: jenis, TAHUN: th,
    BULAN: bln.join(','), JUMLAH: String(nombor_(d.jumlah)), RESIT: d.resit, CATATAN: String(d.catatan || '').replace(/[<>]/g, '').slice(0, 200),
    STATUS: 'MENUNGGU', DIPROSES_OLEH: '', TARIKH_PROSES: '' });
  c.put('ibn_' + kunci, '1', 60);
  return { ok: true, msg: 'Notis bayaran dihantar. Jurulatih akan mengesahkan.' };
};
API.notis_senarai = function (u) {
  var g = gelJur_(u), nama = {};
  baca_('AHLI').forEach(function (a) { nama[a.NO_KP] = a; });
  return { ok: true, notis: baca_('BAYARAN_NOTIS').filter(function (n) { return n.KOD_GELANGGANG === g.KOD; }).map(function (n) {
    var a = nama[n.NO_KP] || {};
    return { id: n.ID, no_kp: n.NO_KP, nama: a.NAMA || n.NO_KP, no_ahli: a.NO_AHLI || '', tarikh: n.TARIKH_HANTAR, jenis: n.JENIS, tahun: n.TAHUN, bulan: n.BULAN,
      jumlah: n.JUMLAH, resit: n.STATUS === 'MENUNGGU' ? n.RESIT : '', catatan: n.CATATAN, status: n.STATUS };
  }).sort(function (a, b) { return b.tarikh.localeCompare(a.tarikh); }).slice(0, 100) };
};
API.notis_resit = function (u, p) {
  var g = gelJur_(u), n = cariSatu_('BAYARAN_NOTIS', 'ID', p.id);
  if (!n || n.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Tiada.' };
  return { ok: true, resit: n.RESIT };
};
API.notis_sahkan = function (u, p) {
  var g = gelJur_(u), n = cariSatu_('BAYARAN_NOTIS', 'ID', p.id);
  if (!n || n.KOD_GELANGGANG !== g.KOD) return { ok: false, msg: 'Notis tiada.' };
  if (n.STATUS !== 'MENUNGGU') return { ok: false, msg: 'Notis sudah diproses.' };
  var tarikh = n.TARIKH_HANTAR.slice(0, 10);
  if (n.JENIS === 'TAHUNAN') {
    var a = cariSatu_('AHLI', 'NO_KP', n.NO_KP);
    var r = API.rekod_yuran(u, { kod: g.KOD, no_ahli: a ? a.NO_AHLI : '', tahun: n.TAHUN, jumlah: n.JUMLAH, tarikh: tarikh, paksa: true });
    if (!r.ok) return r;
  } else {
    var bl = n.BULAN.split(',').filter(String), sebulan = Math.round(nombor_(n.JUMLAH) / bl.length * 100) / 100;
    for (var i = 0; i < bl.length; i++) {
      var r2 = API.yb_simpan(u, { no_kp: n.NO_KP, bulan: bl[i], tahun: n.TAHUN, jumlah: sebulan, tarikh: tarikh, kaedah: 'QR' });
      if (!r2.ok) return r2;
    }
  }
  kemaskini_('BAYARAN_NOTIS', n._r, { STATUS: 'DISAHKAN', DIPROSES_OLEH: u.ID, TARIKH_PROSES: masa_() });
  return { ok: true, msg: 'Bayaran disahkan & yuran direkod.' };
};
API.notis_tolak = function (u, p) {
  var g = gelJur_(u), n = cariSatu_('BAYARAN_NOTIS', 'ID', p.id);
  if (!n || n.KOD_GELANGGANG !== g.KOD || n.STATUS !== 'MENUNGGU') return { ok: false, msg: 'Notis tiada / sudah diproses.' };
  kemaskini_('BAYARAN_NOTIS', n._r, { STATUS: 'DITOLAK', CATATAN: (n.CATATAN ? n.CATATAN + ' | ' : '') + 'Ditolak: ' + String(p.sebab || '').slice(0, 100), DIPROSES_OLEH: u.ID, TARIKH_PROSES: masa_() });
  return { ok: true, msg: 'Notis ditolak.' };
};
