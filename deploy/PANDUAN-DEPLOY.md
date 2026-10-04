# Panduan Deploy ke Hostinger (tanpa terminal)

Untuk paket **Shared Hosting Business** dengan hPanel. Semua langkah memakai
**File Manager** dan **phpMyAdmin**. Tidak perlu SSH, Composer, atau Node di server.

Alamat situs: `https://teguhsmln.ifportofolio.com`
Frontend (React) dan backend (Laravel) berjalan di **satu subdomain**: halaman di `/`,
API di `/api`, gambar upload di `/storage`.

## Susunan folder di server

Folder subdomain (`teguhsmln`) yang sudah ada **tetap dipakai**: ke situlah frontend diletakkan.
Hanya backend (`teguh-app`) yang berada di luar folder itu, supaya `.env` (password database)
tidak bisa diunduh lewat browser.

```
domains/ifportofolio.com/
├── public_html/
│   └── teguhsmln/        ← folder subdomain yang SUDAH ADA
│       ├── index.html, assets/, images/    ┐ isi web-root.zip
│       ├── index.php, .htaccess            ┘
│       └── storage/                          isi uploads.zip + gambar upload baru
└── teguh-app/            ← BARU, isi teguh-app.zip (di luar folder web)
```

Susunan folder tiap akun bisa sedikit berbeda. `teguh-app` boleh berada:

- **di luar** folder subdomain (susunan di atas): paling aman, cocok untuk deploy manual lewat zip.
- **di dalam** folder subdomain (`teguhsmln/teguh-app/`): dibutuhkan untuk **update otomatis lewat
  GitHub** memakai akun FTP yang dibatasi ke folder subdomain. Tetap aman: akses ke `/teguh-app/...`
  selalu **403** (aturan di `.htaccess` web root, ditambah `teguh-app/.htaccess`), sudah diuji.

`index.php` mencarinya otomatis: pertama di dalam folder subdomain, lalu sampai 6 tingkat ke atas.

## Isi paket (folder `deploy-output`)

| File | Fungsi |
|---|---|
| `teguh-app.zip` | Backend Laravel lengkap (sudah termasuk `vendor`) dan `.env` production |
| `web-root.zip` | Hasil build React, `index.php` Laravel, dan `.htaccess` |
| `uploads.zip` | Gambar upload yang sudah ada (opsional) |
| `vendor.zip` | Hanya folder `vendor` (tanpa `.env`), untuk memperbarui dependensi PHP nanti |
| `database-import.sql` | **Database dengan data asli** (report, project, akun admin), dibuat dari export phpMyAdmin |
| `schema-kosong.sql` | Alternatif: struktur database kosong (tanpa data) |
| `admin.sql` | Alternatif: akun admin untuk database kosong (lihat "Menyiapkan paket") |

## Langkah di hPanel

### 1. Cek subdomain dan folder-nya
**Domains → Subdomains**: pastikan `teguhsmln.ifportofolio.com` ada, lalu catat folder
tujuannya (biasanya `public_html/teguhsmln`). Folder ini disebut **web root** di bawah.

### 2. Pilih versi PHP
**Websites → Advanced → PHP Configuration**: pilih **PHP 8.2 atau 8.3** (Laravel 12 butuh
minimal 8.2).

### 3. Buat database dan impor
1. **Databases → MySQL Databases**: buat database + user + password. Catat ketiganya
   (nama biasanya berawalan `u123456789_`).
2. Klik **Enter phpMyAdmin** pada database itu. **Pilih database-nya di panel kiri**, lalu tab
   **Import** → pilih `database-import.sql` → **Go**. File ini sudah berisi struktur, data, dan akun admin.

> **Jangan impor export phpMyAdmin mentah dari laptop.** Export biasanya diawali `CREATE DATABASE`
> dan `USE`, yang ditolak hosting dengan error `#1044 Access denied ... to database`. Ubah dulu
> dengan `deploy\prepare-db-import.ps1` (lihat "Menyiapkan paket"); hasilnya `database-import.sql`.
>
> Tidak punya data dari laptop? Impor `schema-kosong.sql`, lalu `admin.sql`, dan isi konten
> lewat panel admin. Jangan impor ke database yang sudah berisi tabel: kalau pernah gagal
> sebagian, hapus semua tabel di phpMyAdmin dulu (Check all → With selected: Drop).

### 4. Upload backend
1. **File Manager** → buka folder `domains/ifportofolio.com/`, yaitu folder yang
   **sejajar dengan `public_html`**, bukan di dalamnya (lihat "Susunan folder di server").
2. **Upload** `teguh-app.zip` → klik kanan → **Extract** → hasilnya folder `teguh-app`. Hapus zip-nya.
3. Buka `teguh-app/.env` (klik kanan → **Edit**), isi tiga baris ini dengan data dari langkah 3:
   ```
   DB_DATABASE=...
   DB_USERNAME=...
   DB_PASSWORD=...
   ```
   Simpan. (`DB_HOST=localhost` sudah benar untuk Hostinger.)

### 5. Upload frontend
1. Buka **web root** (langkah 1). Kalau di dalamnya masih ada situs HTML lama, **download
   dulu sebagai cadangan**, lalu hapus isinya.
2. **Upload** `web-root.zip` → **Extract** di folder itu.
3. (Opsional) **Upload** `uploads.zip` → **Extract** di folder yang sama → muncul folder `storage`.
4. Pastikan file tersembunyi `.htaccess` dan `index.php` ada. Di File Manager:
   **Settings → Show hidden files**.

### 6. Uji
- `https://teguhsmln.ifportofolio.com/` → halaman portofolio tampil.
- `https://teguhsmln.ifportofolio.com/api/projects` → muncul JSON, mis. `{"success":true,"data":[]}`
  (kosong kalau belum ada project, itu normal).
- `https://teguhsmln.ifportofolio.com/admin/login` → login dengan akun admin (yang ikut di
  `database-import.sql`, atau dari `admin.sql` kalau memakai database kosong).
- Refresh di halaman dalam (mis. `/admin`) tidak boleh 404.

### 7. Bersih-bersih
Hapus `teguh-app.zip`, `web-root.zip`, `uploads.zip`, dan semua file `.sql` dari server dan dari
tempat lain yang tidak perlu. `database-import.sql` berisi hash password admin dan pesan
pengunjung, jangan di-commit atau dibagikan ke publik.

## Jika ada masalah

| Gejala | Penyebab / solusi |
|---|---|
| Halaman putih atau 500 | Buka `teguh-app/storage/logs/laravel.log`, baca baris ERROR paling bawah. Biasanya `.env` salah (nama/user/password DB) atau PHP < 8.2. |
| Tulisan "Folder 'teguh-app' tidak ditemukan" | `teguh-app` harus ada di folder domain (sejajar `public_html`), bukan di dalam web root. |
| 404 saat refresh halaman dalam | `.htaccess` hilang dari web root (file tersembunyi, cek Show hidden files). |
| `/api/...` menampilkan halaman React, bukan JSON | `.htaccess` atau `index.php` hilang, atau `mod_rewrite` tidak aktif. |
| Impor SQL error `#1044 Access denied ... to database` | File berisi `CREATE DATABASE`/`USE`. Pakai `database-import.sql` (hasil `prepare-db-import.ps1`), bukan export mentah. |
| Impor SQL error "table already exists" | Impor sebelumnya gagal sebagian. Hapus semua tabel di phpMyAdmin, lalu impor ulang. |
| Login selalu gagal | Akun admin belum ada di database, atau email/password salah. |
| Upload gambar gagal | Pastikan folder `storage` di web root bisa ditulis (permission 755), dan ukuran gambar ≤ 5 MB. |
| Gambar tidak muncul | `uploads.zip` belum di-extract, atau data database tidak cocok dengan isi folder `storage`. |

## Update otomatis lewat GitHub (untuk Teguh)

Setelah setup sekali di bawah, Teguh cukup `git push` ke `main`: GitHub Actions membangun React dan
Laravel, lalu meng-upload lewat FTP. Tidak perlu lewat pemilik hosting dan tidak perlu terminal.
Workflow-nya: `.github/workflows/deploy_teguhsmln.yml` (langkah build: `deploy/ci-build.sh`).

**Yang di-upload:** kode frontend dan backend (sekitar 66 file backend + 20 file frontend, 9 MB). Folder **`vendor`
tidak ikut**: ~6.000 file kecil lewat FTPS terbukti timeout setelah 54 menit (`Timeout (data socket)`).
`vendor` sudah ada di server dan hanya berubah kalau dependensi PHP berubah (lihat "Memperbarui vendor").
**Tidak disentuh:** `teguh-app/.env`, `teguh-app/storage/` (log), folder `storage/` (gambar upload),
dan database. Action hanya menghapus file yang dulu ia upload sendiri.
**Konten** (report, project) tetap diubah lewat panel admin di situs live. Push kode tidak mengubah database.

### Setup sekali

**1. Pindahkan folder `teguh-app` ke dalam folder subdomain.** Lakukan SEBELUM push pertama.
Di File Manager (aktifkan **Show hidden files** dulu):
1. Buka `domains/ifportofolio.com/`, klik kanan folder **`teguh-app`** → **Move** (atau drag & drop)
   → tujuan: folder subdomain (`public_html/teguhsmln`).
2. Hasilnya harus **`teguhsmln/teguh-app/.env`**. `.env`, `vendor`, dan `storage` ikut karena yang
   dipindahkan adalah foldernya. Move hanya mengganti lokasi, jadi instan dan tidak ada salinan ganda.
3. Cek langsung: situs dan `/api/projects` tetap normal, dan `/teguh-app/.env` harus **403**.

> **Pindahkan foldernya, bukan isinya.** Jangan membuang isi `teguh-app` (`app/`, `vendor/`, `.env`,
> `storage/`, ...) langsung ke folder subdomain: `.env` bisa terbuka dan folder `storage` Laravel
> bertabrakan dengan folder `storage` gambar upload.
>
> Mau kembali ke susunan lama? Move folder `teguh-app` ke `domains/ifportofolio.com/` lagi.

**2. Akun FTP.** hPanel → **Files → FTP Accounts**. Sebaiknya buat akun khusus untuk Teguh dengan
**Directory = folder subdomain**, jangan memberikan akun utama hosting. Catat hostname, username,
dan password-nya. Akun lama yang dipakai workflow lama juga boleh, selama folder subdomain bisa dijangkau.

**3. Isi pengaturan di repo GitHub** (Settings → Secrets and variables → Actions):

| Jenis | Nama | Isi |
|---|---|---|
| Secret | `FTP_SERVER` | hostname FTP dari hPanel (tanpa `ftp://`) |
| Secret | `FTP_USERNAME`, `FTP_PASSWORD` | dari akun FTP |
| Variable (opsional) | `FTP_WEB_DIR` | folder web di server, relatif terhadap akar akun FTP |
| Variable (opsional) | `FTP_APP_DIR` | folder `teguh-app` di server, relatif terhadap akar akun FTP |
| Variable (opsional) | `FTP_PROTOCOL` | `ftp` jika `ftps` (default) gagal tersambung |
| Variable (opsional) | `SITE_URL` | jika alamat situs berubah |

Bawaan di workflow: `FTP_WEB_DIR=./` dan `FTP_APP_DIR=./teguh-app/`, cocok untuk akun FTP yang akarnya
**folder subdomain itu sendiri** (dibuat dengan Directory = folder subdomain). Kalau akar akun FTP-nya
`public_html`, isi `FTP_WEB_DIR=./teguhsmln/` dan `FTP_APP_DIR=./teguhsmln/teguh-app/`.

**4. Tes dulu dengan simulasi (dry-run), baru deploy sungguhan.** Push ke `main` adalah deploy
**sungguhan** ke situs yang live, jadi tes dulu lewat pull request:
1. Push ke branch baru (bukan `main`), lalu buka **Pull Request** ke `main`.
2. Workflow jalan otomatis dalam mode **simulasi**: build penuh, login FTP, dan mencatat file yang akan
   dikirim, **tanpa mengubah apa pun di server**. Hasilnya ada di bagian **Checks** pada PR (ringkasan
   mode ada di tab Summary).
3. Hijau berarti build, `FTP_SERVER`/username/password, dan protokol (`ftps`) beres. Merah, lihat tabel
   "Kalau deploy gagal" di bawah.
4. **Merge** PR: itu men-trigger deploy **sungguhan**.

Dry-run **tidak** membuktikan bahwa folder tujuannya benar, dan tidak menguji pembuatan folder atau
pengiriman file (itu hanya terjadi di deploy sungguhan). Yang diuji hanya build dan login FTP. Cocokkan
`FTP_WEB_DIR` / `FTP_APP_DIR` dengan kolom **Directory** di hPanel → FTP Accounts. Bukti paling kuat bahwa
deploy mendarat di folder yang benar: setelah deploy sungguhan, `/.ftp-deploy-sync-state.json` di situs
berubah menjadi **403**.

Mau tes tanpa PR? **Actions → Deploy to Hostinger → Run workflow** (kolom `dry_run` aktif secara bawaan).
Tombol ini baru muncul setelah workflow ada di branch `main`. Sebelum itu, pakai cara PR di atas.

> Pull request dari **fork** tidak menerima secrets, jadi langkah FTP dilewati dan hanya build yang
> diperiksa. Dry-run FTP penuh butuh branch di repo yang sama (akses kolaborator).

**5. Merge ke `main`, lalu pantau di tab Actions.** Deploy pertama mengirim semua file (tanpa `vendor`),
beberapa menit saja; deploy berikutnya hanya file yang berubah. **Jangan dibatalkan di tengah jalan**:
file yang sedang ditulis saat itu bisa terpotong (deploy berikutnya memperbaikinya).

> **Re-run memakai workflow versi lama.** "Re-run all jobs" menjalankan lagi workflow **dari commit run
> itu**. Kalau Anda memperbaiki file workflow, **push commit baru**, jangan Re-run.

**6. Cek setelah deploy pertama:**
- `/api/projects` tetap menampilkan JSON dan situs normal.
- `/teguh-app/.env` tetap **403** (bukan isi file).
- File `.env` Anda tidak berubah: deploy hanya menimpa file kode, tidak pernah `.env`.

### Sehari-hari
Ubah kode, commit, push ke `main`, dan sekitar 2–5 menit kemudian sudah online. Status deploy ada di tab
**Actions**; kalau merah, buka lognya. Untuk perubahan yang berisiko, buka PR dulu: simulasinya jalan
otomatis sebelum merge.

**Sebelum `git pull` di laptop Teguh:** commit atau `git stash` dulu perubahan lokal yang belum
disimpan, supaya tidak bentrok dengan file yang diubah di update ini.

### Memperbarui `vendor` (jarang: hanya kalau dependensi PHP berubah)
Workflow memberi **peringatan** (tab Summary dan anotasi run) kalau `composer.json` / `composer.lock`
berubah dalam sebuah push. Saat itu `vendor` di server harus diperbarui manual, dan ini butuh akses hPanel:
1. Di laptop, jalankan `deploy\build-deploy.ps1`; hasilnya `deploy-output\vendor.zip`.
2. File Manager → buka folder subdomain (tempat `teguh-app` berada) → **Upload** `vendor.zip` → **Extract**
   → pilih **overwrite**. Isinya hanya `teguh-app/vendor/...`, jadi `.env` **tidak** tertimpa.
3. Hapus `vendor.zip` dari server.

Jangan memakai opsi `include_vendor` di Run workflow kecuali terpaksa: itu mengunggah ~6.000 file lewat FTP
dan sudah terbukti timeout setelah 54 menit.

### Kalau ada migrasi database baru
Server tidak punya terminal, jadi migrasi **tidak jalan otomatis**. Pilih salah satu:
- Kirim SQL perubahannya ke pemilik hosting untuk diimpor lewat phpMyAdmin, atau
- Pasang **Cron Job** di hPanel (Advanced → Cron Jobs) yang menjalankan
  `cd <jalur-ke>/teguh-app && php artisan migrate --force` tiap beberapa menit. Perintah ini hanya
  menjalankan migrasi yang belum pernah jalan. **Belum diuji di Hostinger**: versi PHP yang dipakai
  cron harus 8.2 atau lebih baru, dan jalur lengkapnya tampil di File Manager.

### Kalau deploy gagal

| Pesan di log Actions | Penyebab / solusi |
|---|---|
| `530 Login incorrect` / `530 Login authentication failed` | `FTP_USERNAME` / `FTP_PASSWORD` / `FTP_SERVER` salah atau sudah kedaluwarsa (akun/password FTP diubah, atau menunjuk server lama). Isi secrets **tidak bisa dilihat di GitHub, hanya bisa ditimpa**: buat akun FTP baru di hPanel, lalu isi ulang ketiganya. Setelah itu uji dengan **Run workflow** (`dry_run` aktif): simulasi ini sudah menguji login. |
| Timeout, `ECONNREFUSED`, atau error TLS saat **menyambung** | Set variable `FTP_PROTOCOL` = `ftp`. |
| `Timeout (data socket)` setelah berjalan lama | Terlalu banyak file kecil lewat FTPS. Biasanya `vendor` ikut terunggah (workflow lama, atau `include_vendor` aktif). Pakai workflow terbaru yang melewati `vendor`, lalu **push commit baru**. |
| `550` / `No such directory` | `FTP_WEB_DIR` / `FTP_APP_DIR` tidak sesuai akar akun FTP (lihat tabel di atas). |
| `GAGAL: ...` dari langkah Build | Pesannya menjelaskan sendiri (mis. build frontend gagal). Perbaiki lalu push lagi. |

## Update manual (cadangan, kalau GitHub Actions tidak dipakai)

- **Ubah isi frontend:** build ulang (`deploy\build-deploy.ps1`), upload `web-root.zip` baru,
  Extract dan pilih **overwrite**. Folder `storage` (gambar upload) tidak ikut tertimpa.
- **Ubah backend:** upload `teguh-app.zip` baru dan Extract (overwrite), **lalu cek `.env`**
  karena ikut tertimpa. Simpan salinan `.env` yang sudah terisi sebelum overwrite.
- **Hanya dependensi PHP yang berubah:** pakai `vendor.zip` (tidak menimpa `.env`).

## Menyiapkan paket (di laptop, oleh yang membantu setup)

Butuh Laragon (PHP 8.3 + MySQL) dan Node. Dari folder repo, di PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File deploy\build-deploy.ps1        # 4 file zip
```

Database, pilih **salah satu**:

```powershell
# A. Ada data dari laptop (export phpMyAdmin disimpan sebagai schema.sql di root repo,
#    atau tunjuk file lain dengan -Source). Menghasilkan database-import.sql.
powershell -ExecutionPolicy Bypass -File deploy\prepare-db-import.ps1

# B. Mulai kosong. Menghasilkan schema-kosong.sql dan admin.sql (tanya nama, email, password).
powershell -ExecutionPolicy Bypass -File deploy\export-schema.ps1
powershell -ExecutionPolicy Bypass -File deploy\new-admin-sql.ps1
```

Kalau alamat situsnya berbeda, tambahkan `-SiteUrl https://alamat-baru` pada `build-deploy.ps1`.

Hasil ada di `deploy-output` (satu level di atas folder repo). Password admin dipilih oleh
pemilik web saat menjalankan `new-admin-sql.ps1`. Password tidak disimpan di mana pun
selain sebagai hash di `admin.sql`.

`prepare-db-import.ps1` tidak mengubah file sumber. Ia membuang `CREATE DATABASE`/`USE`, dan
mengosongkan `personal_access_tokens` serta `sessions` (sisa login pengembangan). Data lain
tidak disentuh, termasuk teks laporan yang menyebut `127.0.0.1`.
