# Instalasi jsQR Library

Untuk menambahkan dukungan scanning dari gambar sebagai alternatif kamera, Anda perlu menginstall library jsQR:

## Instalasi

Jalankan perintah berikut di terminal:

```bash
npm install jsqr
```

Untuk dukungan TypeScript:
```bash
npm install --save-dev @types/jsqr
```

Atau jika menggunakan pnpm (seperti proyek Anda):
```bash
pnpm add jsqr
pnpm add -D @types/jsqr
```

## Jika Menggunakan Yarn
```bash
yarn add jsqr
yarn add -D @types/jsqr
```

## Verifikasi

Setelah instalasi, pastikan library sudah ditambahkan ke `package.json`:

```json
{
  "dependencies": {
    "jsqr": "^x.x.x",
    // ... dependensi lainnya
  }
}
```

## Restart Development Server

Setelah menambahkan dependensi baru, restart server development Anda:

```bash
npm run dev
```

## Jika Menggunakan pnpm (seperti proyek Anda)

Karena proyek ini menggunakan pnpm, pastikan untuk:
1. Menjalankan: `pnpm add jsqr`
2. Setelah itu, jalankan: `pnpm install` (jika diperlukan)
3. Restart server: `npm run dev` atau `pnpm dev`

Setelah jsQR terinstal, fitur upload gambar sebagai alternatif scanner kamera akan berfungsi dengan baik.

## Troubleshooting

Jika masih mendapatkan error "Module not found: Can't resolve 'jsqr'", pastikan:
1. Anda telah menjalankan perintah instalasi dengan benar
2. Anda menggunakan package manager yang sama dengan proyek (pnpm)
3. Anda telah restart development server setelah instalasi
4. Library jsqr terdaftar di dependencies di package.json