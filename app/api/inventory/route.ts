import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: Request) {
  const pool = getPool()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")

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

    query += " ORDER BY i.tgl_masuk DESC"

    const [rows] = await pool.query(query, params)

    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Gagal mengambil data inventory" }, { status: 500 })
  }
}
