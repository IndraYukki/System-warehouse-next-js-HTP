import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    // Mengambil data dari tabel materials (pastikan tabel sudah dibuat di MySQL)
    const [rows] = await pool.execute("SELECT * FROM materials ORDER BY material_name ASC");
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { material_name, category_name } = body; // Hanya ambil 2 ini
    const pool = getPool();

    const query = `
      INSERT INTO materials (material_name, category_name)
      VALUES (?, ?)
    `;

    await pool.execute(query, [material_name, category_name]);
    return NextResponse.json({ message: "Berhasil menyimpan material baru" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}