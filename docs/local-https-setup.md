# Menjalankan Server Lokal dengan HTTPS

## Cara 1: Menggunakan Next.js Built-in HTTPS (Development)

Next.js memiliki dukungan bawaan untuk menjalankan server development dengan HTTPS. Anda bisa menggunakan `--experimental-https` flag (untuk versi lama) atau mengkonfigurasi sendiri.

### Menggunakan `next-secure-headers` atau `https-dev`:

1. Install package tambahan:
```bash
npm install --save-dev https
```

2. Buat file `scripts/https-server.js`:
```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Generate sertifikat SSL lokal (dalam development)
const httpsOptions = {
  key: fs.readFileSync('./scripts/key.pem'),
  cert: fs.readFileSync('./scripts/cert.pem')
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server berjalan di https://localhost:${port}`);
  });
});
```

3. Untuk membuat sertifikat lokal, install OpenSSL dan jalankan perintah berikut di terminal:
```bash
openssl req -x509 -newkey rsa:2048 -keyout scripts/key.pem -out scripts/cert.pem -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Dev/OU=Dev/CN=localhost"
```

4. Tambahkan script ke `package.json`:
```json
{
  "scripts": {
    "dev-https": "node scripts/https-server.js",
    "cert": "openssl req -x509 -newkey rsa:2048 -keyout scripts/key.pem -out scripts/cert.pem -days 365 -nodes -subj \"/C=ID/ST=Jakarta/L=Jakarta/O=Dev/OU=Dev/CN=localhost\""
  }
}
```

5. Jalankan server dengan HTTPS:
```bash
npm run dev-https
```

## Cara 2: Menggunakan `local-ssl-proxy`

1. Install `local-ssl-proxy`:
```bash
npm install -g local-ssl-proxy
```

2. Jalankan Next.js di port biasa:
```bash
npm run dev
```

3. Buka terminal baru dan jalankan:
```bash
local-ssl-proxy --source 3001 --target 3000
```

4. Buka browser di `https://localhost:3001`

## Cara 3: Menggunakan `mkcert` (Direkomendasikan)

`mkcert` adalah cara yang paling aman dan mudah untuk membuat sertifikat lokal yang dipercaya.

1. Install `mkcert`:
   - Windows (dengan Chocolatey): `choco install mkcert`
   - Windows (dengan Scoop): `scoop install mkcert`
   - macOS (dengan Homebrew): `brew install mkcert`
   - Linux: Ikuti instruksi di https://github.com/FiloSottile/mkcert#installation

2. Install local CA:
```bash
mkcert -install
```

3. Generate sertifikat untuk localhost:
```bash
mkcert localhost 127.0.0.1 ::1
```

4. Install package yang diperlukan:
```bash
npm install --save-dev devcert
```

5. Buat file `next.config.js` (atau edit yang sudah ada):
```javascript
// next.config.js
const { createServer } = require('https');
const { readFileSync } = require('fs');
const { parse } = require('url');

const isHTTPS = process.env.NODE_ENV !== 'production';

if (isHTTPS) {
  const key = readFileSync('./localhost+2-key.pem');
  const cert = readFileSync('./localhost+2.pem');
  
  module.exports = {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        };
      }
      return config;
    }
  };
}
```

6. Jalankan server dengan HTTPS (gunakan next.config.js yang disesuaikan dengan script server seperti di Cara 1)

## Cara 4: Menggunakan `ngrok` (Untuk Development & Testing)

Ngrok membuat tunnel aman dari internet publik ke server lokal Anda.

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Jalankan Next.js:
```bash
npm run dev
```

3. Buka terminal baru dan jalankan:
```bash
ngrok http 3000
```

4. Ngrok akan memberikan URL HTTPS yang bisa Anda akses dari mana saja, termasuk dari perangkat mobile.

## Cara 5: Konfigurasi Development Server dengan Express

1. Install express dan https:
```bash
npm install express
npm install --save-dev https
```

2. Buat file `server.js`:
```javascript
const express = require('express');
const next = require('next');
const https = require('https');
const fs = require('fs');

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Hanya untuk development
  if (dev) {
    const httpsServer = https.createServer({
      key: fs.readFileSync('./scripts/key.pem'),
      cert: fs.readFileSync('./scripts/cert.pem')
    }, server);

    httpsServer.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Server berjalan di https://localhost:${port}`);
    });
  } else {
    server.get('*', (req, res) => handle(req, res));
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Server berjalan di http://localhost:${port}`);
    });
  }
});
```

3. Pastikan sertifikat sudah dibuat (seperti di Cara 1)

4. Tambahkan script ke `package.json`:
```json
{
  "scripts": {
    "dev-https": "node server.js"
  }
}
```

## Cara Mudah untuk Development: Menggunakan `devcert`

1. Install devcert:
```bash
npm install --save-dev devcert
```

2. Buat script untuk generate sertifikat:
```javascript
// generate-cert.js
const devcert = require('devcert');
const fs = require('fs');

devcert.certificateFor('localhost').then(({ key, cert }) => {
  fs.writeFileSync('./scripts/key.pem', key);
  fs.writeFileSync('./scripts/cert.pem', cert);
  console.log('Sertifikat berhasil dibuat!');
});
```

3. Tambahkan script ke `package.json`:
```json
{
  "scripts": {
    "cert": "node generate-cert.js",
    "dev-https": "node scripts/https-server.js"
  }
}
```

## Catatan Penting

- Sertifikat lokal bukan sertifikat resmi dari Certificate Authority (CA), jadi browser mungkin menampilkan peringatan keamanan
- Untuk development, ini tidak masalah karena Anda bisa menekan "Lanjutkan ke situs" atau "Saya mengerti risikonya"
- Untuk production, pastikan menggunakan sertifikat SSL yang valid dari CA terpercaya
- Beberapa fitur browser seperti akses kamera hanya bekerja di konteks aman (HTTPS), jadi penggunaan HTTPS lokal penting untuk testing fitur-fitur tersebut