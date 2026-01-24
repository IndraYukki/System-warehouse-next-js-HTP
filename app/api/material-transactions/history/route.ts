import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validasi limit dan offset untuk mencegah SQL injection
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json({ error: "Invalid limit or offset parameters" }, { status: 400 });
    }

    const pool = await getPool();

    // Query untuk menghitung total data
    let countQuery = `
      SELECT COUNT(*) as total
      FROM material_transactions mt
      LEFT JOIN material_bom mb ON mt.bom_id = mb.id
      LEFT JOIN materials mat ON mt.material_id = mat.id
      LEFT JOIN customers c ON mat.customer_id = c.id
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
        mt.description,
        mt.created_at,

        mb.part_no,
        mb.product_name,
        mb.product_color,

        mat.material_name,
        mat.category_name,
        mat.customer_id,
        c.nama_customer AS customer_name

      FROM material_transactions mt
      LEFT JOIN material_bom mb ON mt.bom_id = mb.id
      LEFT JOIN materials mat ON mt.material_id = mat.id
      LEFT JOIN customers c ON mat.customer_id = c.id
    `;

    // Siapkan array untuk menyimpan kondisi dan parameter
    const whereConditions = [];
    const baseQueryParameters = []; // Parameter untuk query dasar (tanpa LIMIT/OFFSET)

    // Tambahkan kondisi pencarian jika searchTerm ada
    if (searchTerm) {
      whereConditions.push(`
        (mb.part_no LIKE ? OR
        mb.product_name LIKE ? OR
        mat.material_name LIKE ? OR
        mt.po_number LIKE ?)
      `);
      const searchPattern = `%${searchTerm}%`;
      baseQueryParameters.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Tambahkan kondisi filter tanggal jika ada
    if (startDate && endDate) {
      whereConditions.push(`DATE(mt.created_at) BETWEEN ? AND ?`);
      baseQueryParameters.push(startDate, endDate);
    } else if (startDate) {
      whereConditions.push(`DATE(mt.created_at) >= ?`);
      baseQueryParameters.push(startDate);
    } else if (endDate) {
      whereConditions.push(`DATE(mt.created_at) <= ?`);
      baseQueryParameters.push(endDate);
    }

    // Gabungkan semua kondisi dengan AND jika ada
    if (whereConditions.length > 0) {
      const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
      countQuery += whereClause;
      query += whereClause;
    }

    // Tambahkan ORDER BY ke query utama
    query += ` ORDER BY mt.created_at DESC`;

    // Tambahkan LIMIT dan OFFSET ke query data
    const paginatedQuery = `${query} LIMIT ? OFFSET ?`;

    // Parameter untuk query dengan pagination (termasuk LIMIT dan OFFSET)
    const paginatedQueryParameters = [...baseQueryParameters, limit, offset];

    // Eksekusi query count (tanpa LIMIT dan OFFSET)
    const [countResult]: any = await pool.query(countQuery, baseQueryParameters);
    const total = countResult[0].total;

    // Eksekusi query data dengan LIMIT dan OFFSET
    const [rows] = await pool.query(paginatedQuery, paginatedQueryParameters);

    return NextResponse.json({
      data: rows,
      total: total,
      limit: limit,
      offset: offset
    });
  } catch (error: any) {
    console.error("HISTORY_ERROR:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}