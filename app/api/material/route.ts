import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const pool = getPool();
    // Tambahkan kolom location di query SELECT
    const [rows] = await pool.execute("SELECT id, material_name, category_name, location, stock_kg FROM materials ORDER BY material_name ASC");
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const pool = getPool();
    const { material_name, category_name, location, stock_kg } = await req.json();

    const query = `
      INSERT INTO materials (material_name, category_name, location, stock_kg) 
      VALUES (?, ?, ?, ?)
    `;
    
    await pool.execute(query, [
      material_name, 
      category_name, 
      location || '-', // Jika user kosongkan, simpan tanda strip
      stock_kg || 0
    ]);

    return NextResponse.json({ message: "Material berhasil ditambahkan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}