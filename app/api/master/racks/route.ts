import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  try {
    const [rows] = await pool.query("SELECT * FROM master_racks ORDER BY alamat_rak")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching racks:", error)
    return NextResponse.json({ error: "Gagal mengambil data racks" }, { status: 500 })
  }
}
