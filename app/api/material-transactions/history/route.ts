import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pool = await getPool();

    const [rows] = await pool.execute(`
      SELECT
        mt.id,
        mt.po_number,
        mt.type,
        mt.material_status,
        mt.quantity,
        mt.qty_pcs,
        mt.stock_initial,
        mt.stock_final,
        mt.created_at,

        mb.part_no,
        mb.product_name,

        mat.material_name,
        mat.category_name

      FROM material_transactions mt
      LEFT JOIN material_bom mb ON mt.bom_id = mb.id
      LEFT JOIN materials mat ON mt.material_id = mat.id
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
