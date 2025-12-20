import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// GET: Mendapatkan semua data master parts
export async function GET() {
  const pool = getPool()

  try {
    const [rows] = await pool.query(`
      SELECT
        mp.id,
        mp.part_no,
        mp.nama_part,
        mp.deskripsi,
        mp.satuan,
        mp.customer_id,
        c.nama_customer
      FROM master_parts mp
      LEFT JOIN customers c ON mp.customer_id = c.id
      ORDER BY mp.part_no
    `)
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error("Error fetching parts:", error)
    return NextResponse.json({ error: "Gagal mengambil data parts" }, { status: 500 })
  }
}

// POST: Menambah data master part baru
export async function POST(request: Request) {
  const pool = getPool()

  try {
    const { part_no, nama_part, deskripsi, satuan, customer_id } = await request.json()

    // Validasi input
    if (!part_no || !nama_part || !satuan) {
      return NextResponse.json({ error: "Part No, Nama Part, dan Satuan harus diisi!" }, { status: 400 })
    }

    // Cek apakah part_no sudah ada
    const [existingRows] = await pool.query("SELECT * FROM master_parts WHERE part_no = ?", [part_no])
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Part No sudah terdaftar!" }, { status: 400 })
    }

    // Tambahkan data baru
    await pool.query(
      "INSERT INTO master_parts (part_no, nama_part, deskripsi, satuan, customer_id) VALUES (?, ?, ?, ?, ?)",
      [part_no, nama_part, deskripsi, satuan, customer_id || null]
    )

    return NextResponse.json({
      success: true,
      message: "Data part berhasil ditambahkan!",
    })
  } catch (error) {
    console.error("Error adding part:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}