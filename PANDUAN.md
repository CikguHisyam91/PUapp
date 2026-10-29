# Panduan Pasang SilatApp Pusat (langkah demi langkah)

Fail dalam repo ini:
| Fail | Pergi ke mana |
|---|---|
| `Code.gs` | Apps Script (dalam Google Sheet) |
| `index.html`, `logo.png`, `icon-192.png` | GitHub Pages (laman web) |

---
## PERINGKAT 1 — Asas (Sheet, Super Admin, log masuk, kelulusan)

### A. Cipta Google Sheet
1. Buka **sheets.google.com** → klik **Kosong (Blank)**.
2. Namakan: `SilatApp Pusat DB`.

### B. Masukkan kod Apps Script
1. Dalam Sheet itu, klik menu **Sambungan (Extensions) → Apps Script**.
2. Padam SEMUA kod dalam `Code.gs`, tampal SEMUA isi fail `Code.gs` dari repo ini.
3. Di bahagian atas kod, isi:
   ```
   var SETUP_ID = 'superadmin';
   var SETUP_NAMA = 'Nama Cikgu';
   var SETUP_TELEFON = '01xxxxxxxx';
   var SETUP_KATALALUAN = 'kata laluan anda';
   ```
4. Klik ikon **Simpan** (disket).
5. Di senarai fungsi (sebelah butang Run), pilih **setup** → klik **Run**.
6. Kali pertama Google minta kebenaran: **Review permissions → pilih akaun anda → Advanced → Go to ... (unsafe) → Allow**.
7. Lihat "Execution log": mesti ada `BERJAYA: Super Admin ... dicipta`.
8. **Padam kata laluan** dalam kod (jadikan `''`) → Simpan.

### C. Terbitkan sebagai Web App
1. Klik **Deploy → New deployment**.
2. Ikon gear → pilih **Web app**.
3. Execute as: **Me**. Who has access: **Anyone**.
4. Klik **Deploy** → salin **Web app URL** (berakhir dengan `/exec`).
5. Uji: tampal URL itu di pelayar → mesti nampak `{"ok":true,"msg":"SilatApp Pusat berfungsi"...}`.

> Bila kod dikemas kini kemudian: **Deploy → Manage deployments → ikon pensel (Edit) → Version: New version → Deploy**. JANGAN buat "New deployment" (URL akan bertukar).

### D. Sambungkan laman web
1. Dalam GitHub, buka fail `index.html` → ikon pensel.
2. Cari baris `const API_URL = 'TAMPAL_URL_WEB_APP_DI_SINI';` → ganti dengan URL dari langkah C.4 → **Commit changes**.
3. GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save**.
4. Tunggu 1–2 minit, buka alamat yang dipaparkan (cth. `https://cikguhisyam91.github.io/puapp/`).

### Cara uji Peringkat 1
1. Log masuk dengan ID Super Admin anda.
2. Tab **Pengguna** → *Lantik Admin Negeri* (cth. ID `admin.kedah`, negeri Kedah, kata laluan 8 aksara).
3. Keluar. Klik **Daftar di sini** → isi jurulatih ujian, pilih Kedah → **+ Mohon gelanggang baharu** (cth. Gelanggang Seri Mutiara).
4. Log masuk sebagai `admin.kedah` → tab **Kelulusan** → isi kod `SMT` → **Luluskan** (jadi `KDH-SMT`) → kemudian **Luluskan** jurulatih.
5. Log masuk sebagai jurulatih → berjaya.
6. Cuba salah kata laluan 5 kali → akaun dikunci 15 minit.

---
## PERINGKAT 2 — Ahli & yuran
(Kod sudah ada dalam fail yang sama — tiada salinan baharu.)
1. Sebagai jurulatih → tab **Daftar Ahli** → masukkan No. KP → **Semak** → isi → Daftar. Nombor ahli `KDH-SMT-0001` dijana automatik.
2. Daftar No. KP yang sama di gelanggang lain → sistem tunjuk gelanggang asal dan beri pilihan **Pindah** atau **Ahli Bersama**.
3. Tab **Ahli** → klik nama → kad ahli digital, ubah maklumat, tukar status, **Rekod Yuran**. Rekod yuran tahun yang sama dua kali → keluar AMARAN.

## PERINGKAT 3 — Papan pemuka
Log masuk Super Admin / Admin Negeri → tab **Ringkasan**: jumlah ahli aktif (L/P), ikut negeri, gelanggang aktif (ada aktiviti 60 hari), yuran ikut tahun, butang **Eksport CSV**.

## PERINGKAT 4 — Import data sistem lama Gelanggang Seri Mutiara
1. Pastikan gelanggang anda sudah wujud & diluluskan dalam Pusat (cth. `KDH-SMT`).
2. Buka Sheet sistem LAMA → salin ID dari alamat: `https://docs.google.com/spreadsheets/d/`**`INI_ID_NYA`**`/edit`.
3. Dalam Apps Script Pusat, isi:
   ```
   var IMPORT_ID_SHEET_LAMA = 'INI_ID_NYA';
   var IMPORT_KOD_GELANGGANG = 'KDH-SMT';
   ```
4. Simpan → pilih fungsi **jalankanImport** → **Run** (benarkan akses jika diminta).
5. Log menunjukkan bilangan ahli baru / sedia ada / yuran. Boleh dijalankan berulang kali — tiada pendua (dipadan ikut No. KP). ID lama disimpan dalam lajur `ID_LAMA`. Sheet lama TIDAK diubah langsung.

---
### Nota keselamatan & PDPA
- Kata laluan disimpan sebagai hash SHA-256 + salt (bukan teks biasa).
- Semua semakan peranan dibuat di pelayan (Apps Script).
- Admin Negeri hanya nampak No. KP separa (`150512-08-****`); hanya jurulatih gelanggang itu & Super Admin nampak penuh.
- Jangan kongsi Google Sheet pangkalan data dengan sesiapa.

---
## PDPA, Persetujuan & Penafian (Naik Taraf)

### 1. Isi maklumat rasmi (WAJIB sebelum digunakan)
Buka fail **`teks-pdpa.js`** di GitHub → ikon pensel → ganti teks dalam `[kurungan]`:

| Pemalar | Isi dengan |
|---|---|
| `PERSATUAN` | Nama rasmi persatuan |
| `NO_ROS` | No. pendaftaran ROS |
| `PEGAWAI_DATA` | Nama pegawai yang mengurus data |
| `EMEL_DATA` | E-mel untuk pertanyaan data |
| `TEL_DATA` | No. telefon untuk pertanyaan data |
| `TARIKH_KUATKUASA` | Tarikh notis berkuat kuasa (cth. 1 November 2026) |
| `TEMPOH_SIMPAN` | Tempoh simpan data ahli tidak aktif (lalai: 3 tahun) |

### 2. Versi
`VERSI_PDPA` dan `VERSI_TERMA` mesti **sama** dalam `teks-pdpa.js` **dan** `Code.gs`.
Jika teks diubah, naikkan versi (cth. 1.0 → 1.1) di **kedua-dua** fail — semua pengguna akan diminta bersetuju semula.

### 3. Apa berlaku selepas kemas kini
- Semua jurulatih, Admin Negeri & Super Admin **wajib bersetuju Terma Penggunaan** sekali semasa log masuk seterusnya.
- Ibu bapa diminta bersetuju Notis Privasi sekali di Portal Ibu Bapa.
- Ahli lama tanpa rekod persetujuan disenaraikan dalam tab **🛡️ PDPA** (Super Admin).
- Notis penuh: `privasi.html`.
