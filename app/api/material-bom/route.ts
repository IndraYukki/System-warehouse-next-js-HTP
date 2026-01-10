import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    const query = `
      SELECT mb.*, m.material_name 
      FROM material_bom mb
      LEFT JOIN materials m ON mb.material_id = m.id
      ORDER BY mb.product_name ASC
    `;
    const [rows] = await pool.execute(query);
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      part_no, product_name, product_category, product_color, 
      material_id, weight_part, weight_runner, cavity 
    } = body;
    
    const pool = getPool();
    const query = `
      INSERT INTO material_bom 
      (part_no, product_name, product_category, product_color, material_id, weight_part, weight_runner, cavity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      part_no, product_name, product_category, product_color, 
      material_id, weight_part, weight_runner, cavity
    ]);
    
    return NextResponse.json({ message: "Produk BOM berhasil disimpan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}