-- Tabel Master Parts
CREATE TABLE IF NOT EXISTS master_parts (
  part_no VARCHAR(50) PRIMARY KEY,
  nama_part VARCHAR(255) NOT NULL,
  deskripsi TEXT
);

-- Tabel Master Racks
CREATE TABLE IF NOT EXISTS master_racks (
  alamat_rak VARCHAR(50) PRIMARY KEY,
  zona VARCHAR(50),
  status ENUM('Empty', 'Occupied') DEFAULT 'Empty'
);

-- Tabel Inventory (barang yang ada di gudang)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_no VARCHAR(50) NOT NULL,
  alamat_rak VARCHAR(50) NOT NULL,
  tgl_masuk DATETIME NOT NULL,
  FOREIGN KEY (part_no) REFERENCES master_parts(part_no),
  FOREIGN KEY (alamat_rak) REFERENCES master_racks(alamat_rak)
);

-- Tabel History Logs
CREATE TABLE IF NOT EXISTS history_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_no VARCHAR(50) NOT NULL,
  alamat_rak VARCHAR(50) NOT NULL,
  tipe ENUM('IN', 'OUT') NOT NULL,
  waktu_kejadian DATETIME NOT NULL,
  keterangan TEXT
);
