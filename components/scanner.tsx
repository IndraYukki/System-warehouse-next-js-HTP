/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

interface ScannerProps {
  isOpen: boolean;
  onClose: (result?: string) => void;
  title?: string;
}

export function Scanner({ isOpen, onClose, title = "Scan Kode" }: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanningMode, setScanningMode] = useState<'camera' | 'upload'>('camera'); // Tambahkan state untuk mode scanning
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fungsi untuk memulai kamera
  const startCamera = async () => {
    setError(null);

    // Cek apakah browser mendukung navigator.mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Beberapa browser lama mungkin menggunakan vendor prefix
      (navigator as any).mediaDevices = (navigator as any).mediaDevices ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;

      if (!(navigator as any).mediaDevices || !(navigator as any).mediaDevices.getUserMedia) {
        setError('Browser Anda tidak mendukung akses kamera. Silakan gunakan browser modern seperti Chrome, Firefox, atau Safari terbaru.');
        setHasPermission(false);
        return;
      }
    }

    try {
      // Coba beberapa konfigurasi untuk kompatibilitas mobile
      const constraintsList = [
        {
          video: {
            facingMode: 'environment', // Coba kamera belakang dulu
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        {
          video: {
            facingMode: 'user', // Coba kamera depan jika belakang gagal
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        {
          video: { // Konfigurasi fallback
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        }
      ];

      let stream = null;
      for (const constraints of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break; // Jika berhasil, keluar dari loop
        } catch (err) {
          console.warn('Gagal dengan konfigurasi:', constraints, err);
          // Coba konfigurasi berikutnya
        }
      }

      if (!stream) {
        throw new Error('Tidak dapat mengakses kamera dengan konfigurasi apapun');
      }

      streamRef.current = stream;

      if (videoRef.current) {
        // Hentikan stream lama sebelum mengganti
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          if (oldStream !== stream) {
            oldStream.getTracks().forEach(track => track.stop());
          }
        }

        videoRef.current.srcObject = stream;

        // Hanya mainkan jika belum diputar
        if (videoRef.current.paused) {
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      }

      setHasPermission(true);
      // Setelah kamera aktif, mulai scanning
      setTimeout(startScanning, 1000); // Delay kecil untuk memastikan video siap
    } catch (err: any) {
      console.error('Error accessing camera:', err);

      if (err.name === 'NotAllowedError') {
        setError('Izin kamera ditolak. Silakan atur izin di pengaturan browser Anda.');
      } else if (err.name === 'NotFoundError') {
        setError('Tidak ada kamera yang ditemukan di perangkat ini.');
      } else if (err.name === 'NotReadableError') {
        setError('Kamera sedang digunakan oleh aplikasi lain. Pastikan tidak ada aplikasi lain yang menggunakan kamera.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Kamera tidak mendukung konfigurasi yang diminta. Menggunakan konfigurasi default.');
        // Coba dengan konfigurasi minimal
        try {
          const constraints: MediaStreamConstraints = {
            video: true // Gunakan konfigurasi default
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);

          streamRef.current = stream;

          if (videoRef.current) {
            // Hentikan stream lama sebelum mengganti
            if (videoRef.current.srcObject) {
              const oldStream = videoRef.current.srcObject as MediaStream;
              if (oldStream !== stream) {
                oldStream.getTracks().forEach(track => track.stop());
              }
            }

            videoRef.current.srcObject = stream;

            // Hanya mainkan jika belum diputar
            if (videoRef.current.paused) {
              videoRef.current.play().catch(err => {
                console.error('Error playing video:', err);
              });
            }
          }

          setHasPermission(true);
          // Setelah kamera aktif, mulai scanning
          setTimeout(startScanning, 1000);
        } catch (minimalErr) {
          console.error('Minimal constraints failed:', minimalErr);
          setError('Tidak dapat mengakses kamera. Pastikan kamera tersedia dan tidak digunakan aplikasi lain.');
        }
      } else {
        setError('Tidak dapat mengakses kamera: ' + err.message + '. Pastikan Anda mengakses situs ini melalui HTTPS dan memberikan izin akses kamera.');
      }

      setHasPermission(false);
    }
  };

  // Fungsi untuk menghentikan kamera
  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Juga hentikan video jika ada
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  // Fungsi untuk membuka aplikasi scanner eksternal
  const openExternalScanner = () => {
    // Hentikan kamera sebelum membuka aplikasi eksternal
    stopCamera();

    // Cek apakah di mobile
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Untuk Android, tampilkan opsi aplikasi scanner
      const scannerOptions = [
        { name: "Google Lens", action: () => window.open('https://lens.google/', '_blank') },
        { name: "Kamera (bawaan)", action: () => alert('Buka aplikasi kamera Anda dan arahkan ke kode QR/barcode') },
        { name: "QR Scanner (Play Store)", action: () => window.open('https://play.google.com/store/apps/details?id=com.qrcodereader', '_blank') },
        { name: "QR Droid (Play Store)", action: () => window.open('https://play.google.com/store/apps/details?id=la.droid.qr', '_blank') }
      ];

      // Tampilkan dialog pilihan
      let message = "Pilih aplikasi scanner:\n\n";
      scannerOptions.forEach((option, index) => {
        message += `${index + 1}. ${option.name}\n`;
      });
      message += "\nPilih nomor aplikasi yang ingin digunakan:";

      const choice = prompt(message);
      const choiceIndex = parseInt(choice) - 1;

      if (!isNaN(choiceIndex) && choiceIndex >= 0 && choiceIndex < scannerOptions.length) {
        scannerOptions[choiceIndex].action();
      } else {
        alert('Silakan gunakan aplikasi scanner seperti "QR Scanner" atau kamera bawaan untuk memindai kode.');
      }
    } else if (isIOS) {
      // Untuk iOS, tampilkan opsi
      const scannerOptions = [
        { name: "Kamera (bawaan)", action: () => alert('Gunakan aplikasi kamera bawaan iPhone. Arahkan ke kode QR, akan muncul notifikasi untuk membuka tautan.') },
        { name: "QR Scanner (App Store)", action: () => window.open('https://apps.apple.com/app/qr-scanner/id368496514', '_blank') },
        { name: "QR Reader (App Store)", action: () => window.open('https://apps.apple.com/app/qr-reader-for-iphone/id362107165', '_blank') }
      ];

      // Tampilkan dialog pilihan
      let message = "Pilih aplikasi scanner:\n\n";
      scannerOptions.forEach((option, index) => {
        message += `${index + 1}. ${option.name}\n`;
      });
      message += "\nPilih nomor aplikasi yang ingin digunakan:";

      const choice = prompt(message);
      const choiceIndex = parseInt(choice) - 1;

      if (!isNaN(choiceIndex) && choiceIndex >= 0 && choiceIndex < scannerOptions.length) {
        scannerOptions[choiceIndex].action();
      } else {
        alert('Gunakan kamera bawaan iPhone (iOS 11+) atau install aplikasi scanner dari App Store.');
      }
    } else {
      // Untuk desktop, tawarkan informasi
      alert('Untuk pengalaman scanning terbaik:\n1. Buka di perangkat mobile\n2. Gunakan kamera bawaan atau aplikasi scanner\n3. Salin hasil scan dan masukkan secara manual di sini.');
    }
  };

  // Fungsi untuk memulai proses scanning
  const startScanning = () => {
    if (!videoRef.current) return;

    // Import dinamis library ZXing untuk menghindari masalah SSR
    import('@zxing/library').then((ZXing) => {
      const codeReader = new ZXing.BrowserMultiFormatReader();
      // Gunakan decodeFromVideoDevice untuk performa yang lebih baik di mobile
      const videoElement = videoRef.current;

      // Cek apakah perangkat mobile untuk menyesuaikan interval scanning
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const scanInterval = isMobile ? 500 : 100; // Interval lebih lambat di mobile untuk hemat baterai

      let lastScanTime = 0;

      const scanFrame = async (timestamp: number) => {
        if (!videoElement) return;

        // Hanya scan setiap interval tertentu untuk menghemat performa
        if (timestamp - lastScanTime < scanInterval) {
          requestRef.current = requestAnimationFrame(scanFrame);
          return;
        }

        lastScanTime = timestamp;

        try {
          // Mencoba memindai dari video element
          const result = await codeReader.decodeFromVideoElement(videoElement);
          if (result) {
            onClose(result.getText());
            stopCamera(); // Hentikan kamera setelah mendapatkan hasil
            return;
          }
        } catch (err) {
          // Jika tidak ada kode ditemukan, lanjutkan scanning
        }

        requestRef.current = requestAnimationFrame(scanFrame);
      };

      requestRef.current = requestAnimationFrame(scanFrame);
    }).catch(err => {
      console.error('Error loading ZXing library:', err);
      setError('Gagal memuat library scanner. Silakan refresh halaman.');

      // Fallback ke library jsQR jika ZXing gagal
      import('jsqr').then((jsQR) => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          setError('Gagal menginisialisasi canvas untuk scanning');
          return;
        }

        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const scanInterval = isMobile ? 500 : 100;
        let lastScanTime = 0;

        const scanFrame = (timestamp: number) => {
          if (!videoElement || videoElement.paused || videoElement.readyState === 0) {
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
          }

          if (timestamp - lastScanTime < scanInterval) {
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
          }

          lastScanTime = timestamp;

          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR.default(imageData.data, imageData.width, imageData.height);

          if (code) {
            onClose(code.data);
            stopCamera();
            return;
          }

          requestRef.current = requestAnimationFrame(scanFrame);
        };

        requestRef.current = requestAnimationFrame(scanFrame);
      }).catch(fallbackErr => {
        console.error('Error loading fallback library:', fallbackErr);
        setError('Gagal memuat library scanner. Silakan refresh halaman.');
      });
    });
  };

  // Fungsi untuk scanning dari upload gambar
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = async () => {
        try {
          // Gunakan library jsQR untuk scanning dari gambar
          const jsQRModule = await import('jsqr');
          const jsQR = jsQRModule.default || jsQRModule;
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            setError('Gagal memproses gambar');
            return;
          }

          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, image.width, image.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            onClose(code.data); // Kirim hasil scan ke parent component
          } else {
            setError('Tidak dapat membaca kode dari gambar. Coba gambar yang lain.');
          }
        } catch (importErr) {
          console.error('Error loading jsQR:', importErr);
          setError('Library jsQR tidak ditemukan. Silakan install dengan perintah: pnpm add jsqr');
        }
      };
    } catch (err) {
      setError('Gagal memproses gambar');
      console.error('Error processing image:', err);
    }
  };

  // Mulai kamera ketika dialog dibuka
  useEffect(() => {
    if (isOpen && scanningMode === 'camera') {
      startCamera();
    } else if (isOpen && scanningMode === 'upload') {
      // Jika mode upload, tidak perlu startCamera
      stopCamera();
    }

    // Bersihkan ketika komponen di-unmount
    return () => {
      stopCamera();
    };
  }, [isOpen, scanningMode]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        stopCamera();
        onClose(); // onClose tanpa argumen saat ditutup
      }
    }}>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh]">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={scanningMode === 'camera' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanningMode('camera')}
              >
                Kamera
              </Button>
              <Button
                type="button"
                variant={scanningMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanningMode('upload')}
              >
                Upload
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Scanner untuk memindai kode QR atau barcode
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {error && scanningMode === 'camera' ? (
            <div className="p-4 text-center text-red-500">
              {error}
              <div className="mt-4">
                <Button onClick={startCamera}>Coba Lagi</Button>
              </div>
            </div>
          ) : scanningMode === 'camera' ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-h-[70vh] object-contain"
                playsInline
                autoPlay
                muted
              />

              {/* Overlay untuk menunjukkan area scan */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-green-500 rounded-lg w-64 h-64 max-w-[80%] max-h-[50vh]"></div>
              </div>

              {/* Petunjuk */}
              <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2">
                Arahkan kamera ke kode QR atau barcode
              </div>
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

        <div className="p-4 pt-0 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={openExternalScanner}
          >
            Gunakan Aplikasi Scanner
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              try {
                if (navigator.clipboard) {
                  const text = await navigator.clipboard.readText();
                  if (text && text.trim() !== '') {
                    onClose(text.trim());
                    stopCamera();
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