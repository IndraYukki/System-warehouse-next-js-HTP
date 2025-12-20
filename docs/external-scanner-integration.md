# Integrasi Hasil dari Aplikasi Scanner Eksternal

## Pendekatan untuk Menangani Hasil dari Aplikasi Eksternal

Karena aplikasi scanner eksternal (seperti Barcode Scanner atau kamera bawaan iOS) membuka aplikasi terpisah, kita tidak bisa langsung mendapatkan hasilnya dalam aplikasi kita. Berikut beberapa pendekatan untuk menangani ini:

## 1. Pendekatan URL Redirect (Universal Links / App Links)

### Android App Links
Anda bisa membuat sistem di mana aplikasi scanner mengembalikan hasil ke URL khusus di aplikasi Anda:

1. Konfigurasi Android App Links di `next.config.js`:
```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  // ... konfigurasi PWA lainnya
});

module.exports = withPWA({
  // ... konfigurasi lainnya
  experimental: {
    serverComponentsExternalPackages: ["sharp", "svgo"],
  },
  async redirects() {
    return [
      {
        source: '/scan-result/:code*',
        destination: '/inbound?scanned=:code*', // atau halaman outbound
        permanent: true,
      },
    ]
  }
})
```

2. Di `manifest.json` (jika menggunakan PWA):
```json
{
  "name": "Nama Aplikasi",
  "short_name": "Aplikasi",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "related_applications": [
    {
      "platform": "play",
      "id": "com.nama.aplikasi"
    }
  ],
  "prefer_related_applications": false
}
```

### iOS Universal Links
Untuk iOS, Anda bisa menggunakan Universal Links:

1. Buat file `apple-app-site-associations` di root server:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.nama.aplikasi",
        "paths": ["/scan-result/*"]
      }
    ]
  }
}
```

## 2. Pendekatan Manual (Direkomendasikan untuk sekarang)

Karena konfigurasi App Links/Universal Links memerlukan setup server dan verifikasi, pendekatan manual lebih praktis:

### Implementasi di Halaman Form

Di halaman inbound atau outbound, tambahkan input untuk memasukkan hasil scan secara manual:

```tsx
// Di inbound-form.tsx atau outbound-form.tsx
const [showScannerHelp, setShowScannerHelp] = useState(false);

// Dalam return JSX, tambahkan:
{showScannerHelp && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="font-bold text-lg mb-2">Cara Menggunakan Scanner</h3>
      <ol className="list-decimal pl-5 space-y-2 mb-4 text-sm">
        <li>Install aplikasi scanner (seperti "Barcode Scanner")</li>
        <li>Buka aplikasi dan arahkan ke kode QR/barcode</li>
        <li>Salin hasil scan</li>
        <li>Kembali ke aplikasi ini dan tempel hasilnya di bawah</li>
      </ol>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setShowScannerHelp(false)}
          className="flex-1"
        >
          Tutup
        </Button>
      </div>
    </div>
  </div>
)}

// Dan tambahkan input untuk hasil scan manual
<div className="space-y-2">
  <Label htmlFor="manual-scan">Masukkan hasil scan manual</Label>
  <div className="flex gap-2">
    <Input
      id="manual-scan"
      value={manualScanResult}
      onChange={(e) => setManualScanResult(e.target.value.toUpperCase())}
      placeholder="Tempel hasil scan di sini"
    />
    <Button
      type="button"
      variant="outline"
      onClick={() => setShowScannerHelp(true)}
    >
      ?
    </Button>
  </div>
</div>
```

## 3. Pendekatan Clipboard (Modern)

Untuk pengalaman yang lebih baik, komponen scanner sekarang mendukung pembacaan dari clipboard secara langsung:

```tsx
// Fungsi ini sudah terintegrasi di tombol "Tempel dari Clipboard"
<Button
  variant="outline"
  className="w-full"
  onClick={async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim() !== '') {
          onClose(text.trim()); // Kirim hasil ke parent component
          stopCamera(); // Hentikan kamera
        } else {
          alert('Tidak ada teks di clipboard. Silakan salin hasil scan terlebih dahulu.');
        }
      } else {
        alert('Browser Anda tidak mendukung pembacaan clipboard. Silakan gunakan aplikasi scanner atau mode upload.');
      }
    } catch (err) {
      alert('Gagal membaca dari clipboard. Silakan pastikan izin akses clipboard diberikan.');
    }
  }}
>
  Tempel dari Clipboard
</Button>
```

## 4. Panduan Penggunaan Aplikasi Scanner Eksternal

### Langkah-langkah Umum:
1. **Buka aplikasi scanner** (dari tombol "Gunakan Aplikasi Scanner")
2. **Arahkan kamera ke kode QR/barcode**
3. **Salin hasil scan** (biasanya ada tombol "Copy" di aplikasi scanner)
4. **Kembali ke aplikasi utama**
5. **Tekan tombol "Tempel dari Clipboard"** untuk memasukkan hasil scan

### Untuk Android:
- Buka aplikasi "Kamera" bawaan
- Arahkan ke kode QR
- Jika kode terdeteksi, akan muncul notifikasi atau ikon di layar
- Klik ikon untuk melihat hasil
- Tekan dan tahan teks hasil scan, pilih "Salin"
- Kembali ke aplikasi, tekan "Tempel dari Clipboard"

### Untuk iOS:
- Buka aplikasi "Kamera" bawaan
- Arahkan ke kode QR
- Jika kode terdeteksi, akan muncul notifikasi di atas layar
- Klik notifikasi untuk membuka tautan (jika ada)
- Jika hanya ingin teks, buka aplikasi scanner tambahan
- Salin teks hasil scan
- Kembali ke aplikasi, tekan "Tempel dari Clipboard"

## 5. Rekomendasi Terbaik

Untuk implementasi sekarang, saya merekomendasikan pendekatan bertingkat:

1. **Tombol "Gunakan Aplikasi Scanner"** - Membuka aplikasi scanner eksternal
2. **Tombol "Tempel dari Clipboard"** - Membaca hasil scan dari clipboard
3. **Mode Upload Gambar** - Alternatif jika kamera tidak berfungsi
4. **Kamera Internal** - Fallback terakhir

Ini akan memberikan pengalaman terbaik karena:
- Memberikan pilihan metode scanning tergantung situasi
- Aplikasi scanner eksternal biasanya lebih handal
- Tidak tergantung pada implementasi kamera browser
- Bekerja di semua perangkat mobile
- Tidak memerlukan setup kompleks