# Alternatif Scanner yang Lebih Handal

## 1. BarcodeDetector API (Native Web API)

BarcodeDetector adalah API native yang disediakan oleh browser modern. Ini adalah pilihan terbaik karena:

- Native dan cepat
- Tidak memerlukan library eksternal
- Lebih handal di perangkat mobile

### Implementasi BarcodeDetector

```tsx
// Tambahkan fungsi ini di scanner.tsx
const detectBarcodeWithNativeAPI = async (videoElement: HTMLVideoElement) => {
  if ('BarcodeDetector' in window) {
    // @ts-ignore - BarcodeDetector mungkin belum ada di TypeScript definitions
    const barcodeDetector = new window.BarcodeDetector({
      formats: [
        'code_128', 
        'code_39', 
        'ean_13', 
        'ean_8', 
        'qr_code', 
        'pdf417', 
        'upc_a', 
        'upc_e'
      ]
    });

    try {
      const barcodes = await barcodeDetector.detect(videoElement);
      if (barcodes.length > 0) {
        return barcodes[0].rawValue;
      }
    } catch (err) {
      console.error('BarcodeDetector error:', err);
    }
  }
  return null;
};

// Gunakan di dalam fungsi scanning
const startScanning = () => {
  if (!videoRef.current) return;

  const videoElement = videoRef.current;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const scanInterval = isMobile ? 500 : 100;
  let lastScanTime = 0;
  
  const scanFrame = async (timestamp: number) => {
    if (!videoElement || videoElement.paused || videoElement.readyState === 0) {
      requestRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (timestamp - lastScanTime < scanInterval) {
      requestRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    lastScanTime = timestamp;

    // Coba dengan BarcodeDetector API dulu (native)
    const nativeResult = await detectBarcodeWithNativeAPI(videoElement);
    if (nativeResult) {
      onClose(nativeResult);
      stopCamera();
      return;
    }

    // Jika native gagal, coba dengan library fallback
    try {
      const ZXing = await import('@zxing/library');
      const codeReader = new ZXing.BrowserMultiFormatReader();
      const result = await codeReader.decodeFromVideoElement(videoElement);
      if (result) {
        onClose(result.getText());
        stopCamera();
        return;
      }
    } catch (zxingErr) {
      console.error('ZXing failed, trying jsQR...');
      // Coba fallback ke jsQR
      try {
        const jsQRModule = await import('jsqr');
        const jsQR = jsQRModule.default || jsQRModule;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            onClose(code.data);
            stopCamera();
            return;
          }
        }
      } catch (jsqrErr) {
        console.error('jsQR also failed:', jsqrErr);
      }
    }

    requestRef.current = requestAnimationFrame(scanFrame);
  };

  requestRef.current = requestAnimationFrame(scanFrame);
};
```

## 2. QuaggaJS (untuk Barcode 1D)

Jika Anda terutama memindai barcode 1D (seperti EAN-13, UPC-A), QuaggaJS bisa lebih handal:

```bash
npm install quagga2
# atau
pnpm add quagga2
```

### Implementasi QuaggaJS

```tsx
// Fungsi untuk scanning dengan QuaggaJS
const startQuaggaScanning = () => {
  if (!videoRef.current) return;

  import('quagga2').then((Quagga) => {
    Quagga.default.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current, // Elemen video
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment"
        }
      },
      decoder: {
        readers: [
          "code_128_reader", 
          "ean_reader",
          "ean_8_reader", 
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      }
    }, (err: any) => {
      if (err) {
        console.error('Quagga initialization failed', err);
        return;
      }
      
      Quagga.default.start();
      
      // Event listener untuk hasil scanning
      Quagga.default.onDetected((result: any) => {
        onClose(result.codeResult.code);
        Quagga.default.offDetected();
        Quagga.default.stop();
        stopCamera();
      });
    });
  }).catch(err => {
    console.error('Failed to load QuaggaJS:', err);
  });
};
```

## 3. Integrasi dengan Aplikasi Scanner Eksternal

Cara paling handal di mobile adalah membuka aplikasi scanner eksternal menggunakan intent (Android) atau URL scheme (iOS):

### Aplikasi Scanner Populer

#### Android:
1. **Google Lens** (bawaan di banyak ponsel Android)
   - Tidak perlu install tambahan
   - Terintegrasi di kamera bawaan
   - URL Scheme: `google.lens://`

2. **QR Scanner** (dari ScanMe)
   - Ringan dan cepat
   - Bisa scan berbagai format
   - Play Store: https://play.google.com/store/apps/details?id=com.qrcodereader

3. **QR Droid** (dari DroidLa)
   - Fitur lengkap
   - Bisa scan dan buat QR code
   - Play Store: https://play.google.com/store/apps/details?id=la.droid.qr

4. **Kode** (dari Sylab)
   - Akses cepat dari notifikasi
   - Bisa scan dari galeri
   - Play Store: https://play.google.com/store/apps/details?id=app.scan.kode

#### iOS:
1. **Kamera Bawaan iPhone**
   - Sudah mendukung scan QR secara native
   - Tidak perlu aplikasi tambahan
   - Muncul notifikasi saat melihat QR code

2. **QR Scanner** (dari Denso Wave)
   - Akses cepat
   - Bisa scan dari foto
   - App Store: https://apps.apple.com/app/qr-scanner/id368496514

3. **QR Reader** (dari Splend Apps)
   - Simpel dan cepat
   - Bisa simpan hasil scan
   - App Store: https://apps.apple.com/app/qr-reader-for-iphone/id362107165

### Implementasi di Kode

```tsx
// Fungsi untuk membuka aplikasi scanner eksternal
const openExternalScanner = () => {
  // Hentikan kamera sebelum membuka aplikasi eksternal
  stopCamera();

  // Cek apakah di mobile
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    try {
      // Coba beberapa aplikasi scanner populer di Android
      // Coba Google Lens dulu (bawaan di banyak Android)
      window.location.href = 'google.lens://';
    } catch (err) {
      try {
        // Jika Google Lens tidak tersedia, coba aplikasi lain
        window.location.href = 'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end';
      } catch (e) {
        try {
          // Coba aplikasi QR Scanner populer
          window.open('qrcodereader://scan', '_blank');
        } catch (e2) {
          // Jika semua gagal, tawarkan informasi
          alert('Silakan install aplikasi scanner seperti "QR Scanner", "QR Droid", atau gunakan fitur scan di aplikasi kamera Anda.');
        }
      }
    }
  } else if (isIOS) {
    try {
      // Untuk iOS - coba beberapa URL scheme
      window.location.href = 'scan://scan';
    } catch (err) {
      try {
        window.location.href = 'qrcodereader://scan';
      } catch (e) {
        // Jika semua gagal, tawarkan informasi
        alert('Silakan gunakan kamera bawaan iPhone (iOS 11+) atau install aplikasi scanner seperti "QR Scanner" untuk pengalaman terbaik.');
      }
    }
  } else {
    // Untuk desktop
    alert('Untuk pengalaman scanning terbaik, gunakan perangkat mobile.');
  }
};
```

## 4. Kombinasi Pendekatan Terbaik

Berikut adalah pendekatan yang paling handal:

```tsx
interface ScannerProps {
  isOpen: boolean;
  onClose: (result?: string) => void;
  title?: string;
}

export function Scanner({ isOpen, onClose, title = "Scan Kode" }: ScannerProps) {
  const [scanningMode, setScanningMode] = useState<'camera' | 'upload' | 'external'>('camera');
  // ... state lainnya

  // Prioritas: External Scanner > Native API > Fallback Library
  const startOptimizedScanning = () => {
    if (scanningMode === 'external') {
      openExternalScanner();
      return;
    }

    if (scanningMode === 'camera') {
      // Coba Native API dulu
      if ('BarcodeDetector' in window) {
        startNativeScanning();
      } else {
        // Jika tidak mendukung native API, gunakan fallback
        startFallbackScanning();
      }
    }
  };

  // ... implementasi lainnya
}
```

## 5. UI yang Lebih Ramah Mobile

```tsx
// Tambahkan tombol untuk membuka aplikasi scanner eksternal
{
  scanningMode === 'camera' && (
    <div className="p-4 pt-0">
      <Button
        variant="outline"
        className="w-full mb-2"
        onClick={openExternalScanner}
      >
        Gunakan Aplikasi Scanner
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setScanningMode('upload')}
      >
        Upload Gambar
      </Button>
    </div>
  )
}
```

## Rekomendasi Terbaik

Untuk pengalaman terbaik di mobile:

1. **Gunakan BarcodeDetector API** jika tersedia (browser modern)
2. **Tawarkan opsi untuk membuka aplikasi scanner eksternal** seperti Barcode Scanner atau QR Droid
3. **Sediakan mode upload gambar** sebagai fallback terakhir
4. **Gunakan QuaggaJS** untuk barcode 1D jika native API tidak tersedia

Dengan pendekatan bertingkat seperti ini, pengguna akan mendapatkan pengalaman scanning terbaik tergantung pada perangkat dan browser yang mereka gunakan.