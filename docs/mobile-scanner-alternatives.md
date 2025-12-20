# Alternatif Scanner untuk Mobile

## Masalah Umum Scanner di Mobile

### 1. Kamera Tidak Fokus dengan Baik
- Kamera mobile sering kali tidak fokus otomatis saat menampilkan preview
- Kualitas kamera yang berbeda-beda antar perangkat
- Pencahayaan yang tidak cukup

### 2. Format Barcode/QR Code yang Tidak Didukung
- Beberapa library hanya mendukung format tertentu
- Kualitas gambar yang rendah membuat scanning sulit

### 3. Performa dan Delay
- Proses scanning frame per frame bisa lambat di perangkat mobile
- Beberapa perangkat tidak mendukung semua fitur API kamera

## Alternatif Scanner dan Solusi

### 1. Upload Gambar sebagai Alternatif

Menyediakan opsi untuk mengupload gambar sebagai alternatif dari scanning langsung:

```tsx
// Tambahkan komponen upload di scanner.tsx
const [imageScanning, setImageScanning] = useState(false);

// Fungsi untuk scanning dari gambar
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setImageScanning(true);
  
  try {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    
    image.onload = async () => {
      // Gunakan library jsQR untuk scanning dari gambar
      import('jsqr').then((jsQR) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        context?.drawImage(image, 0, 0, image.width, image.height);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR.default(imageData.data, imageData.width, imageData.height);
          if (code) {
            onClose(code.data); // Kirim hasil scan ke parent component
          } else {
            setError('Tidak dapat membaca kode dari gambar');
          }
        }
      });
    };
  } catch (err) {
    setError('Gagal memproses gambar');
  } finally {
    setImageScanning(false);
  }
};

// Tambahkan tombol upload di JSX
{!imageScanning && (
  <div className="p-4 pt-0">
    <input 
      type="file" 
      accept="image/*" 
      capture="environment" // Membuka kamera langsung di mobile
      onChange={handleImageUpload}
      className="hidden"
      id="image-upload"
    />
    <label 
      htmlFor="image-upload"
      className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
    >
      Gunakan Kamera HP
    </label>
  </div>
)}
```

### 2. Library Alternatif untuk Scanner

#### a. QuaggaJS (untuk barcode 1D)
```bash
npm install quagga
```

#### b. jsQR (untuk QR code dan barcode 2D)
```bash
npm install jsqr
# Atau jika menggunakan pnpm (seperti proyek ini):
pnpm add jsqr
```

Juga install tipe TypeScript:
```bash
npm install --save-dev @types/jsqr
# Atau jika menggunakan pnpm:
pnpm add -D @types/jsqr
```

#### c. Dynamsoft Barcode Reader (komersial tapi sangat powerful)
- Memerlukan lisensi
- Sangat cepat dan akurat di mobile

#### d. BarcodeDetector API (eksperimental, tapi native)
```javascript
// Contoh penggunaan BarcodeDetector API
if ('BarcodeDetector' in window) {
  const barcodeDetector = new BarcodeDetector({
    formats: ['qr_code', 'code_128', 'ean_13']
  });
  
  const barcodes = await barcodeDetector.detect(imageBitmap);
  // Lakukan sesuatu dengan hasil deteksi
} else {
  console.log('BarcodeDetector tidak didukung di browser ini');
}
```

### 3. Perbaikan untuk Scanner saat Ini

Berikut adalah beberapa perbaikan untuk meningkatkan akurasi scanning di mobile:

#### a. Tambahkan tombol fokus manual
```tsx
<Button
  variant="outline"
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
  onClick={() => {
    // Implementasi fokus manual jika didukung
    if (videoRef.current) {
      (videoRef.current as any).requestPointerLock();
    }
  }}
>
  Fokus
</Button>
```

#### b. Optimalkan resolusi kamera untuk mobile
```typescript
const getOptimalCameraConstraints = () => {
  // Untuk mobile, gunakan resolusi yang lebih rendah untuk performa lebih baik
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    return {
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },  // Lebih rendah untuk mobile
        height: { ideal: 480 },
        frameRate: { ideal: 15 } // Lebih rendah untuk menghemat daya
      }
    };
  } else {
    return {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
  }
};
```

#### c. Tambahkan fitur zoom untuk mobile
```tsx
// Tambahkan slider zoom untuk mobile
const [zoom, setZoom] = useState(1);

// Di video element, tambahkan style transform
<div className="relative">
  <video
    ref={videoRef}
    className="w-full max-h-[70vh] object-contain"
    style={{ transform: `scale(${zoom})` }}
    playsInline
    autoPlay
    muted
  />
  
  {/* Slider zoom untuk mobile */}
  <div className="absolute bottom-16 left-0 right-0 px-4">
    <input
      type="range"
      min="1"
      max="3"
      step="0.1"
      value={zoom}
      onChange={(e) => setZoom(parseFloat(e.target.value))}
      className="w-full"
    />
  </div>
</div>
```

### 4. Scanner Hybrid (Kamera + Upload Gambar)

Kombinasi dari kamera langsung dan upload gambar sebagai fallback:

**Langkah 1: Install dependensi jsQR**
```bash
pnpm add jsqr
pnpm add -D @types/jsqr
```

**Langkah 2: Implementasi komponen scanner hybrid**
```tsx
interface ScannerProps {
  isOpen: boolean;
  onClose: (result?: string) => void;
  title?: string;
  scanMode?: 'camera' | 'upload'; // Tambahkan mode scan
}

export function Scanner({ isOpen, onClose, title = "Scan Kode", scanMode = 'camera' }: ScannerProps) {
  const [currentMode, setCurrentMode] = useState<'camera' | 'upload'>(scanMode);

  // ... kode lainnya ...

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopCamera();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh]">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={currentMode === 'camera' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentMode('camera')}
              >
                Kamera
              </Button>
              <Button
                type="button"
                variant={currentMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentMode('upload')}
              >
                Upload
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {currentMode === 'camera' ? (
            // Tampilan kamera
            <div className="relative">
              {/* Kode kamera sebelumnya */}
            </div>
          ) : (
            // Tampilan upload
            <div className="p-4 flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span> atau tarik file ke sini
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG, WEBP (MAX. 10MB)</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Tombol batal */}
        <div className="p-4 pt-0">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Langkah 3: Restart server development**
Setelah menginstal jsQR, restart server development Anda:
```bash
npm run dev
```

### 5. Pengujian dan Debugging

Untuk menguji scanner di mobile, Anda bisa:
1. Gunakan remote debugging (Chrome DevTools untuk Android atau Safari Web Inspector untuk iOS)
2. Tambahkan logging untuk melihat frame rate dan error
3. Uji dengan berbagai jenis barcode/QR code
4. Uji dalam kondisi pencahayaan yang berbeda

Dengan kombinasi dari beberapa pendekatan ini, Anda bisa meningkatkan keberhasilan scanning di perangkat mobile.