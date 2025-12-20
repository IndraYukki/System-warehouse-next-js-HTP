# Panduan Setup Database untuk Sistem Gudang (FG)

## Langkah-langkah Instalasi

### 1. Persiapan Laragon
Pastikan Laragon Anda sudah aktif dan layanan MySQL sudah berjalan.

### 2. Membuat Database
Ada dua cara untuk membuat struktur database:

#### Cara 1: Menggunakan phpMyAdmin
1. Buka browser dan akses `http://localhost/phpmyadmin`
2. Klik "Database" di menu atas
3. Masukkan nama database: `warehouse_fg`
4. Klik "Create"
5. Pilih database `warehouse_fg` yang baru dibuat
6. Klik tab "SQL"
7. Salin dan tempel isi dari file `database_structure_qty.sql` yang ada di root project
8. Klik "Go" untuk mengeksekusi

#### Cara 2: Menggunakan Command Line
1. Buka terminal/command prompt
2. Arahkan ke direktori project Anda
3. Jalankan perintah:
   ```bash
   mysql -u root -p < database_structure_qty.sql
   ```
   (Tekan Enter dan kosongkan password jika menggunakan setting default Laragon)

### 3. Konfigurasi Environment
File `.env.local` sudah dibuat dengan konfigurasi berikut:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=warehouse_fg
```

Jika Anda menggunakan password untuk MySQL di Laragon, ubah baris `DB_PASSWORD=` menjadi `DB_PASSWORD=nama_password_anda`.

### 4. Menjalankan Aplikasi
Setelah database siap, jalankan aplikasi dengan:
```bash
npm run dev
```
atau
```bash
pnpm dev
```

## Struktur Database

Database ini memiliki tabel-tabel berikut:

- `master_parts`: Data master dari semua part/barang
- `master_racks`: Data rak penyimpanan beserta zonanya
- `inventory`: Stok barang saat ini dengan kolom `jumlah` untuk kuantitas
- `history_logs`: Riwayat transaksi masuk/keluar barang dengan kolom `jumlah`
- `users`: Data pengguna sistem (jika fitur login diterapkan)

### Relasi Tabel
- `inventory.part_no` berelasi dengan `master_parts.part_no`
- `inventory.alamat_rak` berelasi dengan `master_racks.alamat_rak`
- `history_logs.part_no` berelasi dengan `master_parts.part_no`
- `history_logs.alamat_rak` berelasi dengan `master_racks.alamat_rak`

## Fungsionalitas Sistem

### 1. Master Data
- CRUD untuk master parts (tambah, edit, hapus)
- CRUD untuk master racks (tambah, edit, hapus)

### 2. Transaksi Barang
- **Inbound (Pemasukan Barang)**: Saat barang masuk, sistem akan:
  - Mengecek apakah barang dengan part_no dan alamat_rak yang sama sudah ada di inventory
  - Jika sudah ada, jumlah (qty) akan otomatis bertambah sesuai input dari form
  - Jika belum ada, akan dibuat entri baru di inventory sesuai jumlah dari form
  - Mencatat transaksi di history_logs

- **Outbound (Pengeluaran Barang)**: Saat barang keluar, sistem akan:
  - Mencari barang dengan part_no yang sama dan jumlah >= jumlah yang diminta
  - Mengurangi jumlah (qty) barang sesuai input dari form
  - Jika jumlah menjadi 0, entri akan dihapus dari inventory
  - Jika jumlah yang diminta lebih besar dari satu baris inventory, sistem akan mengurangi dari beberapa baris inventory secara berurutan
  - Mencatat transaksi di history_logs untuk setiap rak yang terlibat

### 3. Fitur Qty Otomatis
- Sistem akan otomatis menambahkan jumlah (qty) saat barang dengan part_no yang sama masuk ke lokasi yang sama
- Sistem akan otomatis mengurangi jumlah (qty) saat barang keluar
- Jika jumlah barang menjadi 0, entri akan dihapus dari inventory

## Troubleshooting

Jika masih mengalami error 500 saat mengakses API:
1. Pastikan nama database benar-benar `warehouse_fg`
2. Pastikan tabel-tabel sudah dibuat sesuai struktur di atas
3. Periksa kembali konfigurasi di file `.env.local`
4. Restart server aplikasi setelah perubahan konfigurasi
5. Jika muncul error foreign key, pastikan tabel yang direferensikan sudah dibuat sebelum tabel yang memiliki foreign key