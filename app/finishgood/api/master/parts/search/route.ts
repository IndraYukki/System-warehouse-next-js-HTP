import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  const { searchParams } = new URL(request.url);
  const part_no = searchParams.get("part_no");

  if (!part_no) {
    return NextResponse.json({ error: "Parameter part_no diperlukan" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
        mp.id,
        mp.part_no,
        mp.nama_part,
        mp.deskripsi,
        mp.satuan,
        mp.customer_id,
        c.nama_customer
      FROM master_parts mp
      LEFT JOIN customers c ON mp.customer_id = c.id
      WHERE mp.part_no = ?`,
      [part_no]
    );

    const part = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!part) {
      return NextResponse.json({ error: "Part tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(part);
  } catch (error) {
    console.error("Error searching part:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}