import { getPool } from "@/lib/db";

export async function createMaterialsTable() {
  const pool = getPool();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      material_name VARCHAR(255) NOT NULL,
      category_name VARCHAR(255) NOT NULL,
      location VARCHAR(255) DEFAULT '-',
      customer_id INT,
      stock_ori_kg DECIMAL(10, 3) DEFAULT 0,
      stock_scrap_kg DECIMAL(10, 3) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Tabel materials berhasil dibuat atau sudah ada");
  } catch (error) {
    console.error("Error membuat tabel materials:", error);
    throw error;
  }
}

export async function createMaterialTransactionsTable() {
  const pool = getPool();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS material_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      material_id INT NOT NULL,
      bom_id INT NULL,
      material_status ENUM('ORI', 'SCRAP') NOT NULL,
      type ENUM('IN', 'OUT') NOT NULL,
      quantity DECIMAL(10, 3) NOT NULL,
      qty_pcs INT DEFAULT NULL,
      stock_initial DECIMAL(10, 3) NOT NULL,
      stock_final DECIMAL(10, 3) NOT NULL,
      description TEXT DEFAULT NULL,
      po_number VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES materials(id),
      FOREIGN KEY (bom_id) REFERENCES material_bom(id)
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Tabel material_transactions berhasil dibuat atau sudah ada");
  } catch (error) {
    console.error("Error membuat tabel material_transactions:", error);
    throw error;
  }
}

export async function createMaterialBomTable() {
  const pool = getPool();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS material_bom (
      id INT AUTO_INCREMENT PRIMARY KEY,
      part_no VARCHAR(100) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_category VARCHAR(255) DEFAULT NULL,
      product_color VARCHAR(100) DEFAULT NULL,
      material_id INT NOT NULL,
      weight_part DECIMAL(8, 2) NOT NULL,
      weight_runner DECIMAL(8, 2) NOT NULL,
      cavity INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Tabel material_bom berhasil dibuat atau sudah ada");
  } catch (error) {
    console.error("Error membuat tabel material_bom:", error);
    throw error;
  }
}

export async function createCustomersTable() {
  const pool = getPool();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_customer VARCHAR(255) NOT NULL,
      alamat TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Tabel customers berhasil dibuat atau sudah ada");
  } catch (error) {
    console.error("Error membuat tabel customers:", error);
    throw error;
  }
}

export async function runMaterialMigrations() {
  console.log("Memulai migrasi tabel material...");
  
  try {
    // Urutan penting karena adanya foreign key
    await createCustomersTable();
    await createMaterialsTable();
    await createMaterialBomTable();
    await createMaterialTransactionsTable();
    
    console.log("Migrasi tabel material selesai!");
  } catch (error) {
    console.error("Error saat menjalankan migrasi material:", error);
    throw error;
  }
}