import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const pool = await getPool();

    // Query untuk menghitung total data
    let countQuery = `
      SELECT COUNT(*) as total
      FROM material_transactions mt
      LEFT JOIN material_bom mb ON mt.bom_id = mb.id
      LEFT JOIN materials mat ON mt.material_id = mat.id
    `;

    // Query untuk mengambil data
    let query = `
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
        mb.product_color,

        mat.material_name,
        mat.category_name

      FROM material_transactions mt
      LEFT JOIN material_bom mb ON mt.bom_id = mb.id
      LEFT JOIN materials mat ON mt.material_id = mat.id
    `;

    // Tambahkan kondisi pencarian jika searchTerm ada
    if (searchTerm) {
      const searchCondition = `
        WHERE (
          mb.part_no LIKE ? OR
          mb.product_name LIKE ? OR
          mat.material_name LIKE ? OR
          mt.po_number LIKE ?
        )
      `;
      countQuery += searchCondition;
      query += searchCondition;
    }

    // Tambahkan ORDER BY ke query utama, LIMIT dan OFFSET akan ditambahkan nanti
    query += ` ORDER BY mt.created_at DESC`;

    // Validasi limit dan offset untuk mencegah SQL injection
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json({ error: "Invalid limit or offset parameters" }, { status: 400 });
    }

    // Tambahkan LIMIT dan OFFSET ke query data
    const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      const searchParams = [searchPattern, searchPattern, searchPattern, searchPattern];

      // Eksekusi query count
      const [countResult]: any = await pool.execute(countQuery, searchParams);
      const total = countResult[0].total;

      // Eksekusi query data dengan LIMIT dan OFFSET
      const [rows] = await pool.execute(paginatedQuery, searchParams);

      return NextResponse.json({
        data: rows,
        total: total,
        limit: limit,
        offset: offset
      });
    } else {
      // Eksekusi query count tanpa parameter pencarian
      const [countResult]: any = await pool.execute(countQuery);
      const total = countResult[0].total;

      // Eksekusi query data dengan LIMIT dan OFFSET
      const [rows] = await pool.execute(paginatedQuery);

      return NextResponse.json({
        data: rows,
        total: total,
        limit: limit,
        offset: offset
      });
    }
  } catch (error: any) {
    console.error("HISTORY_ERROR:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
