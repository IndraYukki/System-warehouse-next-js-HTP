# Pendekatan Simple Scanner

## Latar Belakang

Karena masalah dengan scanner kamera internal yang tidak bekerja optimal di berbagai perangkat mobile, kami mengganti pendekatan scanner menjadi versi yang lebih sederhana dan handal.

## Perubahan yang Dilakukan

### 1. Komponen Baru: `simple-scanner.tsx`
- Menggantikan komponen `scanner.tsx` yang kompleks
- Fokus pada input manual dan tempel dari clipboard
- Menghilangkan ketergantungan pada akses kamera
- Tetap menyediakan petunjuk untuk penggunaan aplikasi scanner eksternal

### 2. Fungsi Utama
1. **Input Manual** - Pengguna bisa mengetik kode secara langsung
2. **Tempel dari Clipboard** - Membaca hasil scan dari clipboard browser
3. **Petunjuk Penggunaan** - Instruksi untuk menggunakan aplikasi scanner eksternal

### 3. Pembaruan Form
- `inbound-form.tsx` sekarang menggunakan `SimpleScanner`
- `outbound-form.tsx` sekarang menggunakan `SimpleScanner`

## Keunggulan Pendekatan Baru

1. **Lebih Handal** - Tidak tergantung pada akses kamera yang bermasalah
2. **Lebih Cepat** - Tidak perlu mengakses kamera atau memuat library besar
3. **Lebih Kompatibel** - Bekerja di semua perangkat dan browser
4. **Lebih Aman** - Tidak perlu izin akses kamera
5. **Lebih Efisien** - Tidak menggunakan resource kamera dan pemrosesan gambar

## Cara Penggunaan

### Untuk Pengguna:
1. Klik tombol scan (🔍) di form
2. Pilih salah satu opsi:
   - Tempel hasil scan dari clipboard
   - Ketik kode secara manual
   - Ikuti petunjuk untuk menggunakan aplikasi scanner eksternal
3. Klik "Gunakan Kode" untuk melanjutkan

### Untuk Pengembang:
- Gunakan `SimpleScanner` sebagai pengganti `Scanner`
- Interface sama: `{ isOpen, onClose, title }`
- Hasil tetap sama: string kode yang discan

## Instruksi untuk Scan Eksternal

### Android:
1. Buka aplikasi scanner (kamera bawaan atau aplikasi pihak ketiga)
2. Arahkan ke kode QR/barcode
3. Salin hasil scan (biasanya ada tombol copy)
4. Kembali ke aplikasi, klik "Tempel dari Clipboard"

### iOS:
1. Gunakan kamera bawaan atau aplikasi scanner
2. Arahkan ke kode QR
3. Salin teks hasil scan
4. Kembali ke aplikasi, klik "Tempel dari Clipboard"

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

Pendekatan baru ini memberikan pengalaman yang lebih handal dan konsisten di semua perangkat, sambil tetap menyediakan semua fungsi yang dibutuhkan untuk memasukkan kode hasil scan.