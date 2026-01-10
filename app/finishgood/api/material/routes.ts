import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM materials ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { material_name, category_name, weight_part, weight_runner, cavity } = body;
    
    const pool = getPool();
    const query = `
      INSERT INTO materials (material_name, category_name, weight_part, weight_runner, cavity)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await pool.execute(query, [material_name, category_name, weight_part, weight_runner, cavity]);
    return NextResponse.json({ message: "Data Material berhasil disimpan" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}