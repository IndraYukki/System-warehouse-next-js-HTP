const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

// Jalankan perintah berikut untuk membuat sertifikat lokal:
// openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Dev/OU=Dev/CN=localhost"

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Cek apakah file sertifikat ada
const keyPath = './scripts/key.pem';
const certPath = './scripts/cert.pem';

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('Sertifikat SSL tidak ditemukan!');
  console.error('Jalankan perintah berikut untuk membuat sertifikat:');
  console.error('openssl req -x509 -newkey rsa:2048 -keyout scripts/key.pem -out scripts/cert.pem -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Dev/OU=Dev/CN=localhost"');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Server berjalan di https://localhost:${port}`);
    console.log('> Peringatan: Sertifikat ini hanya untuk development. Jangan digunakan di production.');
  });
});