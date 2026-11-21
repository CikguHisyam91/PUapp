---
name: silatapp
description: Panduan kerja untuk SilatApp Pusat (Sri Gayong Panglima Ulung) — sistem keahlian silat percuma atas Google Sheet + Apps Script + GitHub Pages. Guna setiap kali mengubah, membaiki, menguji atau menerangkan apa-apa dalam repo ini (Code.gs, index.html, ibubapa.html, daftar.html, panduan, tema, keselamatan, PDPA, sesi latihan, kehadiran, yuran, kewangan, cawangan, portal ibu bapa).
---

# SilatApp Pusat — panduan kerja

## Pengguna & cara berkomunikasi
- Pemilik ialah **guru, bukan pengaturcara**. Sentiasa jawab dalam **Bahasa Melayu** yang mudah, ringkas, dengan langkah bernombor.
- Gaya pilihan: **"padam semua & ganti semua"**. Bila pengguna perlu ubah kod sendiri (Apps Script), beri arahan salin **keseluruhan fail**, bukan potongan.
- Mesti **100% percuma**: Google Sheet + Apps Script + GitHub Pages. Jangan cadang perkhidmatan berbayar. Vercel/Supabase tidak diperlukan (lihat "Keputusan").
- **Data contoh, gambar & tutorial mesti DATA PALSU 100%** (cth. "ADAM BIN CONTOH", "Gelanggang Contoh", 0120000000). Jangan guna data sebenar.
- Logo rasmi (`logo.png`) mesti digunakan. Pertubuhan: *Persatuan Pencak Silat Sri Gayong Panglima Ulung Malaysia (2020)*, ROS PPM-005-08-27052020.
- Pegawai PDPA: Muhammad Norhisyam bin Shamsudin · e-mel data panglimaulung@gmail.com · no. telefon pegawai sengaja dikosongkan · tarikh kuat kuasa notis 29 September 2026.

## Seni bina
| Fail | Peranan |
|---|---|
| `Code.gs` | Pelayan Apps Script (bound kepada Google Sheet milik panglimaulung@gmail.com). Semua logik & kawalan akses. |
| `index.html` | App jurulatih / Admin Negeri / Super Admin (satu halaman). |
| `ibubapa.html` | Portal ibu bapa (log masuk No. KP anak + tel. waris, tanpa akaun). |
| `daftar.html` | Borang pendaftaran online (`?g=KOD&c=CAWANGAN`). |
| `panduan-ibubapa.html` + `panduan/*.jpg` | Tutorial bergambar (data palsu). |
| `privasi.html`, `teks-pdpa.js` | Notis Privasi & teks persetujuan (cawangan PDPA sahaja). |
| `bersama.js` | Fungsi kongsi: jadual, `esc`, pasang PWA, modul kebolehcapaian (a11y), `labelSesi`. |
| `glass.css` | **Tema premium** Mod Normal/Malam (nama fail kekal walaupun bukan lagi "glass"). Token warna di `:root` & `html[data-tema="normal"]`. |
| `tema.js` | Butang ☀️/🌙, simpan `sp_tema`, ikut tetapan telefon. Dimuat dalam `<head>` selepas glass.css. |
| `sw.js` | Service worker *stale-while-revalidate*. **Naikkan `CACHE`** setiap kali fail halaman berubah. |
| `poster.js`, `qrcode.js` | Poster & QR (qrcode.js = pustaka MIT). |

### Peranan & skop data
- **SUPER_ADMIN**: semua negeri; No. KP penuh; lantik/ganti/ubah Admin Negeri; tetapkan "gelanggang bertugas".
- **ADMIN_NEGERI**: negeri sendiri sahaja; No. KP bertopeng; **tidak** nampak kehadiran/yuran/kewangan/fizikal — kecuali di gelanggang tempat dia ditetapkan bertugas (mod "Gelanggang Saya", mesti dalam negerinya).
- **JURULATIH**: gelanggang sendiri; ketua (`KETUA=YA`) boleh ubah QR bayaran.
- Data dalaman gelanggang (KEHADIRAN, YURAN_BULANAN, KEWANGAN, PENGECUALIAN, FIZIKAL) diasingkan **ikut cawangan**.

### Corak dalam Code.gs
- Pintu: `doPost` → `urus_(p)`. `AWAM` = tindakan tanpa token (`AWAM_FN`), lain-lain perlu token (`API`). `TULIS` = tindakan yang memegang `LockService`.
- **GET hanya untuk `GET_DIBENAR`** (ping, negeri, status_awal, borang_info). Halaman juga hanya guna GET (sandaran) untuk tindakan itu.
- Skema: objek `JADUAL`. Lajur baharu **sentiasa ditambah di HUJUNG** senarai, kemudian **naikkan `VERSI_SKEMA`** → `binaSheet_()` menambah lajur pada Sheet sedia ada secara automatik.
- Bantuan: `baca_` (cache `_tbl`), `tambah_`, `kemaskini_`, `cariSatu_`, `padamBaris_`, `log_` (LOG_AUDIT), `cawSah_`, `cawAhli_`, `gelJur_`, `wajib_`.
- **Ketetapan HURUF BESAR**: `LAJUR_BESAR` + `nilai_()` dalam `tambah_`/`kemaskini_` menukar nama, alamat, lokasi, catatan, kategori, sesi, dll. ke huruf besar. ID log masuk, e-mel, No. KP, telefon, kod & status **tidak** disentuh. `hurufBesarSemua_()` dijalankan sekali bila skema naik. Jika menambah lajur teks bebas baharu, tambah juga ke `LAJUR_BESAR`.
- Telefon waris boleh lebih dari satu nombor (`senaraiTel_`, `telSepadan_`: dipisah `/ , ; & |`, "dan/atau", atau jarak; banding 9 digit terakhir).
- Sesi latihan: `JADUAL_LATIHAN.SESI` & `KEHADIRAN.SESI` (nama bebas, huruf besar, `''` = rekod lama). Kehadiran dikunci ikut tarikh + cawangan + sesi. Masa bertindih ditolak.
- Keselamatan: kata laluan `hash_` = SHA-256 berulang (`v2$`), `semakPw_` naik taraf format lama semasa log masuk; `batalSesi_` (tukar kata laluan/reset/ganti admin); `WAJIB_TUKAR` dikuatkuasa di pelayan; borang online ada perangkap bot (`data.laman`) & had 20/gelanggang/jam; portal ibu bapa 5 cubaan / 15 minit bagi setiap No. KP.
- Sandaran: `pasangSandaranMingguan()` (sekali, Run manual) → `sandaran()` setiap Ahad 2 pagi ke folder Drive "SilatApp Sandaran" (8 salinan).

## Cawangan git
- `claude/upbeat-meitner-9adm99` = **sistem langsung** (GitHub Pages). Buat kerja di sini dahulu.
- `claude/pdpa-persetujuan` = PR #1 (PDPA + Terma Penggunaan) ke `main`. Selepas setiap perubahan pada upbeat: **gabung upbeat → pdpa**.
  - Konflik biasa di `sw.js`: ambil versi upbeat, tambah `'./privasi.html', './teks-pdpa.js'` ke `ASAS`, naikkan nombor `CACHE` melebihi kedua-dua cawangan.
  - Konflik `Code.gs` biasa: senarai `AWAM`/`TULIS` (gabung kedua-dua belah), get laluan `urus_` (kekalkan **kedua-dua** semakan terma & wajib tukar), `VERSI_SKEMA` (ambil yang lebih tinggi). Penanda konflik mungkin `<<<<<<< ours`; jangan gunakan regex yang terpadan dengan baris `=====` dalam komen sepanduk.
- Jangan buat PR baharu tanpa diminta. Mesej commit dalam Bahasa Melayu.

## Selepas mengubah Code.gs — arahan untuk pengguna
Sentiasa beri langkah ini (Code.gs tidak dideploy oleh GitHub):
1. GitHub → buka **Code.gs** (cawangan yang digunakan untuk sistem langsung; jika PR #1 sudah di-merge, ambil dari **main**) → **Copy raw file**.
2. Apps Script → padam semua kod Code.gs → tampal → **Simpan**.
3. **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy** (pautan kekal sama).
Jika hanya fail halaman berubah: tiada langkah; telefon dapat versi baharu automatik (naikkan `CACHE` dalam sw.js).

## Ujian (wajib sebelum push)
Alat ujian disimpan dalam `ujian/` di sebelah fail ini (data palsu, tiada sambungan Google):
```bash
node .claude/skills/silatapp/ujian/ujian_pelayan.js "$PWD"                         # logik pelayan
NODE_PATH=$(npm root -g) node .claude/skills/silatapp/ujian/ujian_paparan.js "$PWD" [folder-gambar]   # Chromium sebenar
```
- `gasmock.js` mensimulasi Apps Script (Sheet dalam memori, Cache, Properties, Lock, ContentService). `G.panggil(p)` = panggil API; `G.baris('AHLI')` = baca Sheet; `G.ctx.doGet(...)` = uji GET; ubah data terus melalui `G.sheets.NAMA.d`.
- Chromium: `/opt/pw-browsers/chromium`; API Google dipintas dengan `page.route('**/script.google.com/**', …)` → gasmock.
- Kedua-dua ujian mesti lulus pada **kedua-dua cawangan**. Tambah ujian baharu ke fail ini untuk ciri baharu.
- Kebolehcapaian: imbas dengan axe-core (WCAG 2.2 AA) dalam **kedua-dua mod** (`sp_tema` = normal / malam); sasaran 0 pelanggaran. Semak kontras token warna jika mengubah `glass.css`.
- Semak sintaks: `node -e "new Function(require('fs').readFileSync('Code.gs','utf8'))"`; untuk HTML, ekstrak `<script>` dan `node --check`.
- Elakkan heredoc dengan kandungan rumit dalam Bash (boleh disekat semakan keselamatan) — tulis skrip dengan alat Write.

## Keputusan yang telah dibuat (jangan ulang perbincangan)
- Tema: rata, ringan, tanpa `backdrop-filter`/animasi berat (kelajuan telefon murah). Warna utama emas; Mod Normal guna emas gelap `#8A6212` untuk teks (kontras).
- Kelajuan: sw.js stale-while-revalidate, logo/ikon dimampatkan, preconnect ke script.google.com. Kelewatan 1–2 s dari Google Sheet ialah had platform percuma.
- Vercel **tidak** menambah keselamatan bermakna untuk sistem ini (log masuk & data kekal di Apps Script/Sheet). Keutamaan keselamatan pengguna: 2FA pada panglimaulung@gmail.com, Sheet tidak dikongsi (Restricted), sandaran mingguan dipasang, kata laluan kuat.
- Kunci Google Sheet dengan kata laluan seperti Excel tidak wujud; kawalan akses melalui perkongsian Drive & akaun Google.

## Senarai semak setiap perubahan
1. Ubah pada `claude/upbeat-meitner-9adm99`; jika skema berubah, lajur di hujung + naikkan `VERSI_SKEMA`.
2. Naikkan `CACHE` dalam `sw.js` jika fail halaman berubah; tambah fail baharu ke `ASAS`.
3. Jalankan ujian pelayan + paparan (dan axe jika UI berubah). Tunjuk gambar contoh (data palsu) kepada pengguna untuk perubahan rupa.
4. Commit (Bahasa Melayu) → push → gabung ke `claude/pdpa-persetujuan` → uji semula → push.
5. Lapor dalam Bahasa Melayu: apa berubah, keputusan ujian, dan **langkah pengguna** (Deploy Apps Script jika Code.gs berubah).
