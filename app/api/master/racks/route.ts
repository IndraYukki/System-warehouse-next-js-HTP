import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// GET: Mendapatkan semua data master racks
export async function GET() {
  const pool = getPool()

  try {
    const [rows] = await pool.query("SELECT * FROM master_racks ORDER BY alamat_rak")
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error("Error fetching racks:", error)
    return NextResponse.json({ error: "Gagal mengambil data racks" }, { status: 500 })
  }
}

// POST: Menambah data master rack baru
export async function POST(request: Request) {
  const pool = getPool()
  
  try {
    const { alamat_rak, zona, kapasitas, status } = await request.json()

    // Validasi input
    if (!alamat_rak || !zona) {
      return NextResponse.json({ error: "Alamat Rak dan Zona harus diisi!" }, { status: 400 })
    }

    // Cek apakah alamat_rak sudah ada
    const [existingRows] = await pool.query("SELECT * FROM master_racks WHERE alamat_rak = ?", [alamat_rak])
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Alamat Rak sudah terdaftar!" }, { status: 400 })
    }

    // Tambahkan data baru
    await pool.query(
      "INSERT INTO master_racks (alamat_rak, zona, kapasitas, status) VALUES (?, ?, ?, ?)",
      [alamat_rak, zona, kapasitas || 0, status || 'available']
    )

    return NextResponse.json({
      success: true,
      message: "Data rak berhasil ditambahkan!",
    })
  } catch (error) {
    console.error("Error adding rack:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}