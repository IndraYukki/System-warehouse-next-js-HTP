import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    const query = `
      SELECT
      mb.id,
      mb.part_no,
      mb.product_name,
      mb.weight_part,
      mb.weight_runner,
      mb.cavity,
      m.material_name,
      m.category_name,
      m.stock_ori_kg,
      m.stock_scrap_kg
    FROM material_bom mb
    JOIN materials m ON mb.material_id = m.id
    ORDER BY mb.part_no

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