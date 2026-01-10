import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();
    // Query yang sudah diperbaiki agar kompatibel dengan sql_mode=only_full_group_by
    const query = `
      SELECT 
        mt.id,
        mt.created_at,
        mt.po_number,
        mt.type,
        mt.quantity,
        mt.description,
        mt.stock_initial,
        mt.stock_final,
        mt.qty_pcs,
        m.material_name,
        m.category_name,
        mb.part_no,
        mb.product_name,
        mb.product_color
      FROM material_transactions mt
      JOIN materials m ON mt.material_id = m.id
      LEFT JOIN material_bom mb ON (
        -- Jika ini outbound produksi, kita sambungkan via nama produk di deskripsi
        (mt.type = 'OUT' AND mt.description LIKE CONCAT('%', mb.product_name, '%'))
        OR 
        -- Atau jika material_id sama (untuk inbound/general)
        (mt.type = 'IN' AND mt.material_id = mb.material_id)
      )
      -- Kita hapus GROUP BY mt.id karena mt.id sudah unik, 
      -- tapi kita gunakan DISTINCT atau limitasi JOIN agar tidak duplikat
      GROUP BY mt.id, mb.id 
      ORDER BY mt.created_at DESC
    `;
    const [rows] = await pool.execute(query);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("DATABASE_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}