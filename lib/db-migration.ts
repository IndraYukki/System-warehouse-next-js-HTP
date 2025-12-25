import { getPool } from "@/lib/db";

export async function createUsersTable() {
  const pool = getPool();
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nama_panggilan VARCHAR(100) NOT NULL,
      role ENUM('admin', 'user', 'manager') NOT NULL DEFAULT 'user',
      email VARCHAR(100) UNIQUE,
      nomor_telepon VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Tabel users berhasil dibuat atau sudah ada");
  } catch (error) {
    console.error("Error membuat tabel users:", error);
    throw error;
  }
}

// Fungsi untuk menambahkan user admin default
export async function addDefaultAdminUser() {
  const pool = getPool();
  
  const checkUserQuery = "SELECT id FROM users WHERE username = ?";
  const [existingUsers] = await pool.query(checkUserQuery, ["admin"]);
  
  if ((existingUsers as any[]).length === 0) {
    const defaultPassword = "admin123"; // Password default untuk admin
    const insertUserQuery = `
      INSERT INTO users (username, password, nama_panggilan, role, email, nomor_telepon) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      await pool.query(insertUserQuery, [
        "admin",
        defaultPassword,
        "Administrator",
        "admin",
        "admin@warehouse.com",
        "+6281234567890"
      ]);
      console.log("User admin default berhasil ditambahkan");
      console.log("Username: admin");
      console.log("Password: admin123");
    } catch (error) {
      console.error("Error menambahkan user admin default:", error);
      throw error;
    }
  } else {
    console.log("User admin default sudah ada");
  }
}