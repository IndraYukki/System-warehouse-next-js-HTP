import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// GET: Mendapatkan data master parts dengan fitur search dan pagination
export async function GET(request: Request) {
  const pool = getPool()
  const { searchParams } = new URL(request.url)

  // Ambil parameter untuk pagination dan search
  const limit = parseInt(searchParams.get("limit") || "10")
  const offset = parseInt(searchParams.get("offset") || "0")
  const search = searchParams.get("search") || ""

  // Validasi bahwa limit dan offset adalah angka yang valid
  if (isNaN(limit) || limit <= 0) {
    return NextResponse.json({ error: "Parameter limit harus berupa angka positif" }, { status: 400 })
  }
  if (isNaN(offset) || offset < 0) {
    return NextResponse.json({ error: "Parameter offset harus berupa angka non-negatif" }, { status: 400 })
  }

  try {
    // Query untuk menghitung total data
    let countQuery = `
      SELECT COUNT(*) as total
      FROM master_parts mp
      LEFT JOIN customers c ON mp.customer_id = c.id
    `

    // Parameter untuk query count
    let countParams: string[] = []

    // Tambahkan kondisi search jika ada
    if (search) {
      countQuery += `
        WHERE mp.part_no LIKE ? OR mp.nama_part LIKE ?
      `
      countParams = [`%${search}%`, `%${search}%`]
    }

    const [countResult] = await pool.query(countQuery, countParams)
    const total = (countResult as any)[0].total as number

    // Query untuk mengambil data dengan pagination dan search
    let query = `
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
    `

    // Parameter untuk query data
    let queryParams: string[] = []

    // Tambahkan kondisi search jika ada
    if (search) {
      query += `
        WHERE mp.part_no LIKE ? OR mp.nama_part LIKE ?
      `
      queryParams = [`%${search}%`, `%${search}%`]
    }

    // Urutkan dan tambahkan limit serta offset
    query += `
      ORDER BY mp.part_no
      LIMIT ? OFFSET ?
    `
    queryParams.push(limit, offset)

    const [rows] = await pool.query(query, queryParams)

    // Kembalikan data dalam format yang sesuai dengan komponen
    return NextResponse.json({
      data: Array.isArray(rows) ? rows : [],
      total: parseInt(total),
      limit: limit,
      offset: offset
    })
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