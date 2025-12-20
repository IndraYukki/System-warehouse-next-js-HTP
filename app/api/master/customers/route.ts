import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// GET: Mendapatkan semua data customer
export async function GET() {
  const pool = getPool()

  try {
    const [rows] = await pool.query("SELECT * FROM customers ORDER BY nama_customer")
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Gagal mengambil data customers" }, { status: 500 })
  }
}

// POST: Menambah data customer baru
export async function POST(request: Request) {
  const pool = getPool()
  
  try {
    const { nama_customer, alamat, telepon, email } = await request.json()

    // Validasi input
    if (!nama_customer) {
      return NextResponse.json({ error: "Nama Customer harus diisi!" }, { status: 400 })
    }

    // Tambahkan data baru
    await pool.query(
      "INSERT INTO customers (nama_customer, alamat, telepon, email) VALUES (?, ?, ?, ?)",
      [nama_customer, alamat, telepon, email]
    )

    return NextResponse.json({
      success: true,
      message: "Data customer berhasil ditambahkan!",
    })
  } catch (error) {
    console.error("Error adding customer:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}