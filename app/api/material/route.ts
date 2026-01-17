import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();

    const [rows] = await pool.execute(`
      SELECT 
        id,
        material_name,
        category_name,
        location,
        COALESCE(stock_ori_kg, 0)   AS stock_ori_kg,
        COALESCE(stock_scrap_kg, 0) AS stock_scrap_kg
      FROM materials
      ORDER BY material_name ASC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const pool = getPool();
    const { material_name, category_name, location } = await req.json();

    const query = `
      INSERT INTO materials 
      (material_name, category_name, location, stock_ori_kg, stock_scrap_kg)
      VALUES (?, ?, ?, 0, 0)
    `;

    await pool.execute(query, [
      material_name,
      category_name,
      location || '-'
    ]);

    return NextResponse.json({
      message: "Material berhasil ditambahkan"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
