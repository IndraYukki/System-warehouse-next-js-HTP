import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const pool = getPool();

  try {
    const [rows]: any = await pool.execute(`
      SELECT
        mt.id,
        mt.po_number,
        mt.type,
        mt.material_status,
        mt.qty_pcs,
        mt.quantity,
        mt.stock_initial,
        mt.stock_final,
        mt.created_at,

        mb.part_no,
        mb.product_name,

        m.material_name,
        m.category_name

      FROM material_transactions mt
      LEFT JOIN material_bom mb 
        ON mt.bom_id = mb.id
      LEFT JOIN materials m 
        ON mt.material_id = m.id
      ORDER BY mt.created_at DESC
    `);

    return NextResponse.json(rows);

  } catch (error: any) {
    console.error("HISTORY_ERROR:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
