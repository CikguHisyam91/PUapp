/* =====================================================================
 * TEKS RASMI PDPA, TERMA PENGGUNAAN & PENAFIAN — SilatApp Pusat
 * Dimuatkan oleh: index.html, daftar.html, ibubapa.html, privasi.html
 *
 * ISI MAKLUMAT DI BAWAH (ganti teks dalam [kurungan]).
 * PENTING: VERSI_PDPA & VERSI_TERMA mesti SAMA dengan nilai dalam Code.gs.
 * Naikkan versi apabila teks berubah — semua pengguna akan diminta bersetuju semula.
 * ===================================================================== */
const PERSATUAN = 'Persatuan Pencak Silat Sri Gayong Panglima Ulung Malaysia (2020)';
const NO_ROS = 'PPM-005-08-27052020';
const PEGAWAI_DATA = 'Muhammad Norhisyam bin Shamsudin';
const EMEL_DATA = 'panglimaulung@gmail.com';
const TEL_DATA = '[NO. TELEFON]';
const TEMPOH_SIMPAN = '3';
const TARIKH_KUATKUASA = '[TARIKH]';
const VERSI_PDPA = '1.0';
const VERSI_TERMA = '1.0';
/* ===================================================================== */

const _e = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* --- TEKS A: NOTIS PRIVASI & PDPA (penuh) --- */
const TEKS_A = [
  ['1. PENGGUNA DATA', `Data peribadi dalam sistem SilatApp Pusat dikumpul dan diproses oleh ${PERSATUAN} ("Persatuan"), No. Pendaftaran ${NO_ROS}. Sistem ini dibangunkan dan ditadbir bagi pihak Persatuan oleh pentadbir sistem yang dilantik. Pentadbir sistem bertindak atas arahan Persatuan dan bukan atas kapasiti peribadi.`],
  ['2. DATA YANG DIKUMPUL', 'Nama, No. KP/MyKid, tarikh lahir, jantina, alamat, no. telefon, maklumat ibu bapa/penjaga, maklumat kesihatan asas, rekod kehadiran, rekod yuran dan bukti bayaran.'],
  ['3. TUJUAN', 'Pendaftaran dan pengurusan keahlian, kehadiran latihan, kutipan yuran, penyertaan kejohanan, keselamatan semasa latihan, dan perhubungan dengan ibu bapa/penjaga. Data tidak akan digunakan untuk tujuan lain.'],
  ['4. PENDEDAHAN', 'Data hanya boleh dilihat oleh jurulatih gelanggang berkenaan dan pegawai Persatuan yang diberi kuasa mengikut peranan. Data tidak dijual atau didedahkan kepada pihak luar kecuali dikehendaki oleh undang-undang.'],
  ['5. PENYIMPANAN & KESELAMATAN', `Data disimpan dalam perkhidmatan Google milik Persatuan dengan kawalan akses, kata laluan tersulit dan log audit. Data ahli tidak aktif akan dipadam atau diarkib selepas ${TEMPOH_SIMPAN} tahun.`],
  ['6. HAK ANDA', `Anda berhak meminta akses, membetulkan, atau menarik balik persetujuan dengan menghubungi: ${PEGAWAI_DATA}, ${EMEL_DATA}, ${TEL_DATA}. Menarik balik persetujuan boleh menyebabkan keahlian tidak dapat diteruskan.`],
  ['7. KETEPATAN MAKLUMAT', 'Anda bertanggungjawab memastikan maklumat yang diberikan adalah benar dan terkini.']
];
function htmlPdpaPenuh() {
  return `<h2 style="margin:0 0 4px">NOTIS PRIVASI &amp; PERLINDUNGAN DATA PERIBADI</h2>
    <div style="opacity:.75;font-size:13px;margin-bottom:14px">Versi ${_e(VERSI_PDPA)} · Berkuat kuasa ${_e(TARIKH_KUATKUASA)}</div>
    ${TEKS_A.map(b => `<h3 style="margin:16px 0 4px;font-size:15px">${_e(b[0])}</h3><p style="margin:0;line-height:1.6">${_e(b[1])}</p>`).join('')}`;
}

/* --- TEKS A-RINGKAS (dalam borang) --- */
const TEKS_A_RINGKAS = [
  `Data anda dikumpul oleh ${PERSATUAN} untuk urusan keahlian silat sahaja.`,
  'Hanya jurulatih gelanggang & pegawai yang diberi kuasa boleh melihatnya.',
  'Data tidak dijual atau didedahkan kepada pihak luar.',
  `Disimpan dengan selamat; dipadam/diarkib selepas ${TEMPOH_SIMPAN} tahun tidak aktif.`,
  `Hubungi ${EMEL_DATA} untuk akses, pembetulan atau tarik balik persetujuan.`
];
function htmlPdpaRingkas() {
  return `<ul style="margin:0;padding-left:18px;line-height:1.6">${TEKS_A_RINGKAS.map(t => `<li>${_e(t)}</li>`).join('')}</ul>
    <a href="privasi.html" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;color:#E2B55A;font-weight:600">Baca notis penuh ›</a>`;
}
const KOTAK_PDPA = `Saya telah membaca dan bersetuju dengan Notis Privasi (Versi ${VERSI_PDPA}).`;
const KOTAK_PENJAGA = 'Saya ibu bapa/penjaga yang sah dan memberi persetujuan bagi pihak anak/jagaan saya.';

/* --- TEKS B: TERMA PENGGUNAAN & AKUJANJI KERAHSIAAN (jurulatih / admin) --- */
const TEKS_B = [
  'Akaun ini diberikan kepada saya oleh Persatuan untuk urusan rasmi gelanggang/negeri sahaja.',
  'Saya akan merahsiakan semua data peribadi ahli dan tidak akan menyalin, memuat turun, menangkap layar, berkongsi atau mendedahkan data tersebut kepada mana-mana pihak tanpa kebenaran Persatuan.',
  'Saya tidak akan berkongsi kata laluan saya dan akan log keluar apabila menggunakan peranti awam/peranti orang lain.',
  'Saya hanya akan mendaftarkan ahli yang telah memberi persetujuan sendiri melalui borang rasmi, atau persetujuan ibu bapa/penjaga bagi ahli bawah 18 tahun.',
  'Saya akan melaporkan dengan segera kepada Persatuan jika saya mengesyaki akaun saya disalah guna atau berlaku kebocoran data.',
  'Saya faham bahawa setiap tindakan saya direkod dalam log audit.',
  'Saya bertanggungjawab secara peribadi atas sebarang penyalahgunaan data yang berpunca daripada tindakan atau kecuaian saya sendiri. Persatuan dan pentadbir sistem tidak bertanggungjawab atas penyalahgunaan tersebut.',
  'Akses saya akan ditamatkan apabila saya tidak lagi memegang jawatan.'
];
function htmlTerma() {
  return `<h2 style="margin:0 0 4px;font-size:19px">TERMA PENGGUNAAN &amp; AKUJANJI KERAHSIAAN</h2>
    <div style="opacity:.75;font-size:13px;margin-bottom:12px">Versi ${_e(VERSI_TERMA)} · Berkuat kuasa ${_e(TARIKH_KUATKUASA)}</div>
    <p style="margin:0 0 8px">Dengan menggunakan akaun ini, saya mengaku dan bersetuju bahawa:</p>
    <ol style="margin:0;padding-left:20px;line-height:1.6">${TEKS_B.map(t => `<li style="margin-bottom:6px">${_e(t)}</li>`).join('')}</ol>`;
}
function htmlTermaRingkas() {
  return `<ul style="margin:0;padding-left:18px;line-height:1.6">
    <li>Akaun untuk urusan rasmi gelanggang/negeri sahaja.</li>
    <li>Rahsiakan data ahli — jangan salin, muat turun, tangkap layar atau kongsi tanpa kebenaran Persatuan.</li>
    <li>Jangan kongsi kata laluan; log keluar di peranti awam.</li>
    <li>Daftar ahli hanya dengan persetujuan (ibu bapa/penjaga bagi bawah 18 tahun).</li>
    <li>Semua tindakan direkod dalam log audit; anda bertanggungjawab atas penyalahgunaan oleh anda.</li></ul>`;
}
const KOTAK_TERMA = `Saya telah membaca, memahami dan bersetuju dengan Terma Penggunaan & Akujanji Kerahsiaan (Versi ${VERSI_TERMA}).`;

/* --- TEKS C: PENAFIAN --- */
const TEKS_C = `SilatApp Pusat dimiliki oleh ${PERSATUAN} dan ditadbir bagi pihak Persatuan. Sistem ini dibangunkan secara sukarela menggunakan perkhidmatan pihak ketiga (Google). Persatuan mengambil langkah keselamatan yang munasabah, namun tidak menjamin sistem bebas daripada gangguan perkhidmatan pihak ketiga. Pengguna bertanggungjawab atas ketepatan maklumat yang dimasukkan dan atas penggunaan akaun masing-masing. Sebarang pertanyaan: ${EMEL_DATA}.`;
function htmlPenafian(kecil) {
  return `<div style="font-size:${kecil ? 12 : 14}px;line-height:1.55;opacity:.8"><b>PENAFIAN</b><br>${_e(TEKS_C)}</div>`;
}
function htmlKakiPrivasi() {
  return `<div style="text-align:center;margin-top:14px;font-size:13px"><a href="privasi.html" target="_blank" rel="noopener" style="color:#E2B55A">Notis Privasi</a></div>`;
}

/* --- TEKS D: PENGESAHAN JURULATIH (daftar ahli manual) --- */
const KOTAK_JURULATIH = 'Saya mengesahkan ahli / ibu bapa / penjaga telah memberi persetujuan bertulis atau melalui borang rasmi. Saya bertanggungjawab atas pengesahan ini.';
