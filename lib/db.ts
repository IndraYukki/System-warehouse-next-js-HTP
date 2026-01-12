import mysql from "mysql2/promise"

let _pool: mysql.Pool | null = null

export function getPool() {
  if (!_pool) {
    _pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "warehouse_db",
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    })
  }
  return _pool
}

// 🔑 export alias bernama `pool`
export const pool = getPool()
