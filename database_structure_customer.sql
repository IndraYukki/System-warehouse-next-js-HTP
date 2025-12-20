-- Membuat database jika belum ada
CREATE DATABASE IF NOT EXISTS warehouse_fg;
USE warehouse_fg;

-- Tabel Customer
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_customer VARCHAR(255) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Master Parts
CREATE TABLE master_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_no VARCHAR(50) UNIQUE NOT NULL,
    nama_part VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    satuan VARCHAR(20),
    customer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    CONSTRAINT fk_parts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
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

-- Tabel Inventory dengan kolom customer_id
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_no VARCHAR(50) NOT NULL,
    alamat_rak VARCHAR(50),
    customer_id INT,  -- Menambahkan kolom customer_id ke inventory
    jumlah INT DEFAULT 0,
    tgl_masuk DATE,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_no (part_no),
    INDEX idx_alamat_rak (alamat_rak),
    INDEX idx_customer_id (customer_id),
    CONSTRAINT fk_inventory_part_no FOREIGN KEY (part_no) REFERENCES master_parts(part_no) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_alamat_rak FOREIGN KEY (alamat_rak) REFERENCES master_racks(alamat_rak) ON DELETE SET NULL,
    CONSTRAINT fk_inventory_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Tabel History Logs
CREATE TABLE history_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_no VARCHAR(50) NOT NULL,
    alamat_rak VARCHAR(50),
    customer_id INT,  -- Menambahkan kolom customer_id ke history
    tipe ENUM('IN', 'OUT') NOT NULL,
    jumlah INT DEFAULT 0,
    waktu_kejadian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_part_no (part_no),
    INDEX idx_alamat_rak (alamat_rak),
    INDEX idx_customer_id (customer_id),
    CONSTRAINT fk_history_part_no FOREIGN KEY (part_no) REFERENCES master_parts(part_no) ON DELETE CASCADE,
    CONSTRAINT fk_history_alamat_rak FOREIGN KEY (alamat_rak) REFERENCES master_racks(alamat_rak) ON DELETE SET NULL,
    CONSTRAINT fk_history_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
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

-- Menambahkan data contoh ke tabel customers
INSERT INTO customers (nama_customer, alamat, telepon, email) VALUES
('PT. ABC Manufacturing', 'Jl. Industri No. 1, Jakarta', '021-12345678', 'info@abc.com'),
('PT. XYZ Corporation', 'Jl. Pabrik No. 5, Bandung', '022-87654321', 'contact@xyz.com'),
('CV. Supplier Jaya', 'Jl. Raya No. 10, Surabaya', '031-11111111', 'admin@supplierjaya.com');

-- Menambahkan data contoh ke tabel master_parts
INSERT INTO master_parts (part_no, nama_part, deskripsi, satuan, customer_id) VALUES
('PRT001', 'Bearing SKF 6204', 'Bearing deep groove ball', 'Pcs', 1),
('PRT002', 'Coupling梅花型', 'Flexible coupling', 'Pcs', 2),
('PRT003', 'Gear Box ST 50', 'Speed reducer gearbox', 'Unit', 3);

-- Menambahkan data contoh ke tabel master_racks
INSERT INTO master_racks (alamat_rak, zona, kapasitas) VALUES
('R01-A01', 'Zona A', 100),
('R01-A02', 'Zona A', 100),
('R02-B01', 'Zona B', 100);

-- Menambahkan data contoh ke tabel inventory
INSERT INTO inventory (part_no, alamat_rak, customer_id, jumlah, tgl_masuk, keterangan) VALUES
('PRT001', 'R01-A01', 1, 50, '2025-01-15', 'Stok awal'),
('PRT002', 'R01-A02', 2, 30, '2025-01-15', 'Stok awal'),
('PRT003', 'R02-B01', 3, 10, '2025-01-15', 'Stok awal');

-- Menambahkan data contoh ke tabel history_logs
INSERT INTO history_logs (part_no, alamat_rak, customer_id, tipe, jumlah, keterangan) VALUES
('PRT001', 'R01-A01', 1, 'IN', 50, 'Stok awal sistem'),
('PRT002', 'R01-A02', 2, 'IN', 30, 'Stok awal sistem'),
('PRT003', 'R02-B01', 3, 'IN', 10, 'Stok awal sistem');