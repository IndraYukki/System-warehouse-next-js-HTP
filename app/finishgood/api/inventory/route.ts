import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

interface InventoryItem {
  id: number
  part_no: string
  nama_part: string
  nama_customer: string
  alamat_rak: string
  zona: string
  jumlah: number
  tgl_masuk: string
  total_jumlah: number
}

interface ApiResponse {
  data: InventoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export async function GET(request: Request) {
  const pool = getPool()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100) // Maksimal 100
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Query untuk mendapatkan data inventory lengkap dengan total per part
    let query = `
      SELECT
        i.id,
        i.part_no,
        mp.nama_part,
        c.nama_customer,
        i.alamat_rak,
        mr.zona,
        i.jumlah,
        i.tgl_masuk,
        totals.total_jumlah
      FROM inventory i
      LEFT JOIN master_parts mp ON i.part_no = mp.part_no
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN master_racks mr ON i.alamat_rak = mr.alamat_rak
      LEFT JOIN (
        SELECT
          part_no,
          SUM(jumlah) as total_jumlah
        FROM inventory
        GROUP BY part_no
      ) totals ON i.part_no = totals.part_no
    `

    const params: string[] = []

    if (search) {
      query += ` WHERE i.part_no LIKE ? OR mp.nama_part LIKE ? OR i.alamat_rak LIKE ? OR c.nama_customer LIKE ?`
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam, searchParam)
    }

    // Validasi bahwa limit dan offset adalah angka positif sebelum digunakan dalam query
    const validatedLimit = Math.max(1, Math.min(100, parseInt(limit.toString())))
    const validatedOffset = Math.max(0, parseInt(offset.toString()))

    query += ` ORDER BY i.tgl_masuk DESC LIMIT ${validatedLimit} OFFSET ${validatedOffset}`

    const [rows] = await pool.query(query, params)

    // Query untuk total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM inventory i
      LEFT JOIN master_parts mp ON i.part_no = mp.part_no
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN master_racks mr ON i.alamat_rak = mr.alamat_rak
    `

    const countParams: string[] = []

    if (search) {
      countQuery += ` WHERE i.part_no LIKE ? OR mp.nama_part LIKE ? OR i.alamat_rak LIKE ? OR c.nama_customer LIKE ?`
      const searchParam = `%${search}%`
      countParams.push(searchParam, searchParam, searchParam, searchParam)
    }

    const [countResult] = await pool.query(countQuery, countParams)
    let totalCount = 0
    if (Array.isArray(countResult) && countResult.length > 0) {
      const firstRow = countResult[0]
      if (firstRow && typeof firstRow === 'object' && firstRow.total !== undefined) {
        totalCount = Number(firstRow.total)
      }
    }

    const response: ApiResponse = {
      data: Array.isArray(rows) ? rows : [],
      total: totalCount,
      limit: validatedLimit,
      offset: validatedOffset
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Gagal mengambil data inventory" }, { status: 500 })
  }
}
