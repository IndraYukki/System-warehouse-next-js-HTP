# Pendekatan Simple Scanner (Versi Sederhana)

## Latar Belakang

Karena masalah dengan scanner kamera internal yang tidak bekerja optimal di berbagai perangkat mobile, kami mengganti pendekatan scanner menjadi versi yang sangat sederhana dan handal - hanya dengan tombol "Tempel dari Clipboard".

## Perubahan yang Dilakukan

### 1. Komponen Baru: `simple-scanner.tsx`
- Menggantikan komponen `scanner.tsx` yang kompleks
- Hanya memiliki satu fungsi utama: tempel dari clipboard
- Tidak ada lagi input manual atau pilihan metode lain
- Menghilangkan semua ketergantungan pada akses kamera dan library pemrosesan gambar

### 2. Fungsi Utama
1. **Tempel dari Clipboard** - Membaca hasil scan dari clipboard browser

### 3. Pembaruan Form
- `inbound-form.tsx` sekarang menggunakan `SimpleScanner`
- `outbound-form.tsx` sekarang menggunakan `SimpleScanner`

## Keunggulan Pendekatan Baru

1. **Sangat Handal** - Tidak tergantung pada akses kamera atau library kompleks
2. **Sangat Cepat** - Tidak perlu mengakses kamera atau memuat library besar
3. **Sangat Kompatibel** - Bekerja di semua perangkat dan browser
4. **Sangat Aman** - Tidak perlu izin akses kamera
5. **Sangat Efisien** - Tidak menggunakan resource kamera dan pemrosesan gambar
6. **Sangat Sederhana** - Hanya satu tombol utama: "Tempel dari Clipboard"

## Cara Penggunaan

### Untuk Pengguna:
1. Klik tombol scan (🔍) di form
2. Buka aplikasi scanner di perangkat Anda (kamera bawaan atau aplikasi scanner)
3. Scan kode QR/barcode yang diinginkan
4. Salin hasil scan (teks kode)
5. Kembali ke aplikasi dan klik tombol "Tempel dari Clipboard"
6. Kode akan otomatis terisi di form

### Untuk Pengembang:
- Gunakan `SimpleScanner` sebagai pengganti `Scanner`
- Interface sama: `{ isOpen, onClose, title }`
- Hasil tetap sama: string kode yang discan

## Kode Contoh Penggunaan

```tsx
// Sebelum
<Scanner
  isOpen={scannerOpen}
  onClose={handleScan}
  title="Scan Part Number"
/>

// Sesudah
<SimpleScanner
  isOpen={scannerOpen}
  onClose={handleScan}
  title="Masukkan Part Number"
/>
```

Pendekatan baru ini memberikan pengalaman yang sangat handal dan sederhana di semua perangkat, hanya dengan satu langkah: tempel dari clipboard.