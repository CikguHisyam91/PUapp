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
  GELANGGANG: ['KOD','NAMA','NEGERI','ALAMAT','KETUA_ID','TARIKH_DAFTAR','STATUS','AKTIVITI_TERAKHIR'],
  PENGGUNA: ['ID','HASH','SALT','NAMA','TELEFON','PERANAN','NEGERI','KOD_GELANGGANG','KETUA','STATUS','TARIKH_DAFTAR','GAGAL','KUNCI_HINGGA'],
  SESI: ['TOKEN','ID','LUPUT'],
  AHLI: ['NO_AHLI','NO_KP','NAMA','JANTINA','TARIKH_LAHIR','BENGKUNG','GELANGGANG_UTAMA','STATUS','TARIKH_DAFTAR','TEL_WARIS','ID_LAMA'],
  KEAHLIAN_GELANGGANG: ['NO_KP','KOD_GELANGGANG','JENIS','STATUS','TARIKH_MULA','TARIKH_TAMAT'],
  YURAN_TAHUNAN: ['NO_KP','KOD_GELANGGANG','TAHUN','JUMLAH','TARIKH_BAYAR','DIREKOD_OLEH'],
  LOG_AUDIT: ['MASA','ID','TINDAKAN','BUTIRAN'],
  // Data dalaman gelanggang (HANYA jurulatih gelanggang itu nampak)
  KEHADIRAN: ['TARIKH','KOD_GELANGGANG','HADIR','BIL_HADIR','CATATAN','DIREKOD_OLEH'],
  YURAN_BULANAN: ['NO_KP','KOD_GELANGGANG','TAHUN','BULAN','JUMLAH','TARIKH_BAYAR','KAEDAH','DIREKOD_OLEH'],
  KEWANGAN: ['ID','KOD_GELANGGANG','TARIKH','JENIS','KATEGORI','KETERANGAN','JUMLAH','DIREKOD_OLEH'],
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
    if (ss.getSheetByName(nama)) return;
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

var AWAM = { ping: 1, negeri: 1, daftar: 1, login: 1, status_awal: 1, cipta_super: 1 };
var TULIS = { hadir_simpan: 1, yb_simpan: 1, yb_padam: 1, kew_simpan: 1, kew_padam: 1, fiz_simpan: 1, fiz_padam: 1, cipta_super: 1, daftar: 1, login: 1, logout: 1, tukar_katalaluan: 1, lulus_gelanggang: 1, status_gelanggang: 1,
  status_pengguna: 1, set_ketua: 1, lantik_admin: 1, daftar_ahli: 1, kemaskini_ahli: 1, status_ahli: 1,
  rekod_yuran: 1, padam_yuran: 1, mohon_gelanggang: 1 };

function urus_(p) {
  var lock = null;
  try {
    var a = p.action;
    if (!sh_('PENGGUNA') || !sh_('FIZIKAL')) binaSheet_();
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
    namaNegeri: namaNegeri_(u.NEGERI), kod_gelanggang: u.KOD_GELANGGANG, nama_gelanggang: g ? g.NAMA : '',
    ketua: u.KETUA === 'YA' };
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
  kemaskini_('PENGGUNA', u._r, { HASH: hash_(p.baru, salt), SALT: salt });
  log_(u.ID, 'TUKAR_KATALALUAN', '');
  return { ok: true, msg: 'Kata laluan ditukar.' };
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
  if (cariSatu_('GELANGGANG', 'KOD', baru)) return { ok: false, msg: 'Kod ' + baru + ' sudah digunakan dalam negeri ini.' };
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
    return { ok: true, msg: x.NAMA + ' dilantik sebagai Admin Negeri ' + namaNegeri_(p.negeri) + '.' };
  }
  if (String(p.katalaluan || '').length < 8) return { ok: false, msg: 'Kata laluan sekurang-kurangnya 8 aksara.' };
  var salt = Utilities.getUuid();
  tambah_('PENGGUNA', { ID: id, HASH: hash_(p.katalaluan, salt), SALT: salt, NAMA: p.nama || id, TELEFON: p.telefon || '',
    PERANAN: 'ADMIN_NEGERI', NEGERI: p.negeri, KOD_GELANGGANG: '', KETUA: 'TIDAK', STATUS: 'AKTIF',
    TARIKH_DAFTAR: hariIni_(), GAGAL: '0', KUNCI_HINGGA: '' });
  log_(u.ID, 'LANTIK_ADMIN', id + ' → ' + p.negeri);
  return { ok: true, msg: 'Admin Negeri ' + id + ' dicipta. Beri ID & kata laluan kepadanya.' };
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
    jenis: k ? k.JENIS : '', status_gel: k ? k.STATUS : '', yuran: yuranTahun || '' };
}

API.senarai_ahli = function (u, p) {
  var g = gelAhli_(u, p.kod), tahun = String(p.tahun || new Date().getFullYear());
  var ahli = {}; baca_('AHLI').forEach(function (a) { ahli[a.NO_KP] = a; });
  var yur = {}; baca_('YURAN_TAHUNAN').forEach(function (y) { if (y.TAHUN === tahun) yur[y.NO_KP] = y.JUMLAH ? 'RM' + y.JUMLAH : 'Ya'; });
  var rs = baca_('KEAHLIAN_GELANGGANG').filter(function (k) { return k.KOD_GELANGGANG === g.KOD; })
    .map(function (k) { var a = ahli[k.NO_KP]; return a ? ahliObj_(a, k, u, g.KOD, yur[a.NO_KP]) : null; })
    .filter(function (x) { return x; });
  rs.sort(function (a, b) { return a.nama.localeCompare(b.nama); });
  return { ok: true, gelanggang: { kod: g.KOD, nama: g.NAMA, negeri: g.NEGERI }, ahli: rs, tahun: tahun };
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
    tambah_('KEAHLIAN_GELANGGANG', { NO_KP: kp, KOD_GELANGGANG: g.KOD, JENIS: 'UTAMA', STATUS: 'AKTIF', TARIKH_MULA: kini, TARIKH_TAMAT: '' });
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
    if (diSini) kemaskini_('KEAHLIAN_GELANGGANG', diSini._r, { JENIS: 'UTAMA', STATUS: 'AKTIF' });
    else tambah_('KEAHLIAN_GELANGGANG', { NO_KP: kp, KOD_GELANGGANG: g.KOD, JENIS: 'UTAMA', STATUS: 'AKTIF', TARIKH_MULA: kini, TARIKH_TAMAT: '' });
    kemaskini_('AHLI', a._r, { GELANGGANG_UTAMA: g.KOD, STATUS: 'AKTIF' });
    log_(oleh, 'PINDAH_AHLI', a.NO_AHLI + ' → ' + g.KOD);
    return { ok: true, msg: a.NAMA + ' dipindahkan ke gelanggang ini. No. ahli kekal: ' + a.NO_AHLI, no_ahli: a.NO_AHLI };
  }
  if (mod === 'bersama') {
    if (diSini) return { ok: false, msg: 'Ahli ini sudah berdaftar di gelanggang ini.' };
    tambah_('KEAHLIAN_GELANGGANG', { NO_KP: kp, KOD_GELANGGANG: g.KOD, JENIS: 'BERSAMA', STATUS: 'AKTIF', TARIKH_MULA: kini, TARIKH_TAMAT: '' });
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
  var ikutNegeri = {}, jumlah = { L: 0, P: 0, semua: 0 };
  baca_('AHLI').forEach(function (a) {
    if (a.STATUS !== 'AKTIF') return;
    var g = gelMap[a.GELANGGANG_UTAMA]; if (!g) return;
    if (u.PERANAN === 'ADMIN_NEGERI' && g.NEGERI !== u.NEGERI) return;
    var n = ikutNegeri[g.NEGERI] || (ikutNegeri[g.NEGERI] = { negeri: g.NEGERI, nama: namaNegeri_(g.NEGERI), L: 0, P: 0, semua: 0 });
    var j = /^P/i.test(a.JANTINA) ? 'P' : 'L';
    n[j]++; n.semua++; jumlah[j]++; jumlah.semua++;
  });

  var bilAhli = {}, bilBersama = {};
  baca_('KEAHLIAN_GELANGGANG').forEach(function (k) {
    if (k.STATUS !== 'AKTIF') return;
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
      bayar: bilYuran[g.KOD] || 0, kutipan: jumYuran[g.KOD] || 0 });
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
  var g = cariSatu_('GELANGGANG', 'KOD', String(kodGelanggang).trim().toUpperCase());
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
  var g = gelJur_(u), t = p.tarikh || hariIni_();
  var rec = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH === t; })[0];
  return { ok: true, tarikh: t, ada: !!rec, hadir: rec && rec.HADIR ? rec.HADIR.split(',') : [], catatan: rec ? rec.CATATAN : '' };
};
API.hadir_simpan = function (u, p) {
  var g = gelJur_(u), t = String(p.tarikh || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return { ok: false, msg: 'Tarikh tidak sah.' };
  var sah = ahliGel_(g.KOD), senarai = (p.hadir || []).filter(function (kp) { return sah[kp]; });
  var o = { TARIKH: t, KOD_GELANGGANG: g.KOD, HADIR: senarai.join(','), BIL_HADIR: String(senarai.length), CATATAN: p.catatan || '', DIREKOD_OLEH: u.ID };
  var rec = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH === t; })[0];
  if (rec) kemaskini_('KEHADIRAN', rec._r, o); else tambah_('KEHADIRAN', o);
  catatAktiviti_(g.KOD);
  return { ok: true, msg: 'Kehadiran ' + t + ' disimpan: ' + senarai.length + ' hadir.' };
};
API.hadir_laporan = function (u, p) {
  var g = gelJur_(u), pre = String(p.tahun) + '-' + ('0' + p.bulan).slice(-2);
  var sesi = baca_('KEHADIRAN').filter(function (x) { return x.KOD_GELANGGANG === g.KOD && x.TARIKH.indexOf(pre) === 0; });
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
