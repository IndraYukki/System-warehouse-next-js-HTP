import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: Request) {
  const pool = getPool()
  const { searchParams } = new URL(request.url)
  const part_no = searchParams.get("part_no")

  try {
    let query = `
      SELECT
        hl.id,
        hl.part_no,
        mp.nama_part,
        hl.alamat_rak,
        c.nama_customer,
        hl.tipe,
        hl.jumlah,
        hl.waktu_kejadian,
        hl.keterangan
      FROM history_logs hl
      LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
      LEFT JOIN customers c ON hl.customer_id = c.id
    `

    const params: string[] = []

    if (part_no) {
      query += " WHERE hl.part_no LIKE ?"
      params.push(`%${part_no}%`)
    }

    query += " ORDER BY hl.waktu_kejadian DESC LIMIT 100"

    const [rows] = await pool.query(query, params)

    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Gagal mengambil data history" }, { status: 500 })
  }
}
