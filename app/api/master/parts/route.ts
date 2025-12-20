import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  try {
    const [rows] = await pool.query("SELECT * FROM master_parts ORDER BY part_no")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching parts:", error)
    return NextResponse.json({ error: "Gagal mengambil data parts" }, { status: 500 })
  }
}
