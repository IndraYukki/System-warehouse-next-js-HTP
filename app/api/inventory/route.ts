import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id,
        i.part_no,
        mp.nama_part,
        i.alamat_rak,
        mr.zona,
        i.tgl_masuk
      FROM inventory i
      LEFT JOIN master_parts mp ON i.part_no = mp.part_no
      LEFT JOIN master_racks mr ON i.alamat_rak = mr.alamat_rak
      ORDER BY i.tgl_masuk DESC
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Gagal mengambil data inventory" }, { status: 500 })
  }
}
