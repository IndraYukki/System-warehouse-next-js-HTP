-- Membuat database jika belum ada
CREATE DATABASE IF NOT EXISTS warehouse_fg;
USE warehouse_fg;

-- Tabel Master Parts
CREATE TABLE master_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_no VARCHAR(50) UNIQUE NOT NULL,
    nama_part VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    satuan VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Master Racks
CREATE TABLE master_racks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alamat_rak VARCHAR(50) UNIQUE NOT NULL,
    zona VARCHAR(50),
    kapasitas INT DEFAULT 0,
    status ENUM('aktif', 'tidak_aktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Inventory dengan kolom jumlah (qty)
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_no VARCHAR(50) NOT NULL,
    alamat_rak VARCHAR(50),
    jumlah INT DEFAULT 0,  -- Ini adalah kolom Qty yang akan otomatis bertambah/kurang
    tgl_masuk DATE,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_no (part_no),
    INDEX idx_alamat_rak (alamat_rak),
    CONSTRAINT fk_inventory_part_no FOREIGN KEY (part_no) REFERENCES master_parts(part_no) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_alamat_rak FOREIGN KEY (alamat_rak) REFERENCES master_racks(alamat_rak) ON DELETE SET NULL
);

-- Tabel History Logs
CREATE TABLE history_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_no VARCHAR(50) NOT NULL,
    alamat_rak VARCHAR(50),
    tipe ENUM('IN', 'OUT') NOT NULL,
    jumlah INT DEFAULT 0,  -- Menyimpan jumlah barang yang masuk/keluar
    waktu_kejadian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_part_no (part_no),
    INDEX idx_alamat_rak (alamat_rak),
    CONSTRAINT fk_history_part_no FOREIGN KEY (part_no) REFERENCES master_parts(part_no) ON DELETE CASCADE,
    CONSTRAINT fk_history_alamat_rak FOREIGN KEY (alamat_rak) REFERENCES master_racks(alamat_rak) ON DELETE SET NULL
);

-- Tabel Users (jika diperlukan untuk autentikasi)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operator', 'viewer') DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menambahkan data contoh ke tabel master_parts
INSERT INTO master_parts (part_no, nama_part, deskripsi, satuan) VALUES
('PRT001', 'Bearing SKF 6204', 'Bearing deep groove ball', 'Pcs'),
('PRT002', 'Coupling梅花型', 'Flexible coupling', 'Pcs'),
('PRT003', 'Gear Box ST 50', 'Speed reducer gearbox', 'Unit');

-- Menambahkan data contoh ke tabel master_racks
INSERT INTO master_racks (alamat_rak, zona, kapasitas) VALUES
('R01-A01', 'Zona A', 100),
('R01-A02', 'Zona A', 100),
('R02-B01', 'Zona B', 100);

-- Menambahkan data contoh ke tabel inventory
INSERT INTO inventory (part_no, alamat_rak, jumlah, tgl_masuk, keterangan) VALUES
('PRT001', 'R01-A01', 50, '2025-01-15', 'Stok awal'),
('PRT002', 'R01-A02', 30, '2025-01-15', 'Stok awal'),
('PRT003', 'R02-B01', 10, '2025-01-15', 'Stok awal');

-- Menambahkan data contoh ke tabel history_logs
INSERT INTO history_logs (part_no, alamat_rak, tipe, jumlah, keterangan) VALUES
('PRT001', 'R01-A01', 'IN', 50, 'Stok awal sistem'),
('PRT002', 'R01-A02', 'IN', 30, 'Stok awal sistem'),
('PRT003', 'R02-B01', 'IN', 10, 'Stok awal sistem');