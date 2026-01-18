import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validasi limit dan offset untuk mencegah SQL injection
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json({ error: "Invalid limit or offset parameters" }, { status: 400 });
    }

    const pool = getPool();

    // Query untuk menghitung total data
    let countQuery = `
      SELECT COUNT(*) as total
      FROM materials m
      LEFT JOIN customers c ON m.customer_id = c.id
    `;

    // Query untuk mengambil data
    let query = `
      SELECT
        m.id,
        m.material_name,
        m.category_name,
        m.location,
        m.customer_id,
        c.nama_customer AS customer_name,
        COALESCE(m.stock_ori_kg, 0)   AS stock_ori_kg,
        COALESCE(m.stock_scrap_kg, 0) AS stock_scrap_kg
      FROM materials m
      LEFT JOIN customers c ON m.customer_id = c.id
    `;

    // Tambahkan kondisi pencarian jika searchTerm ada
    if (searchTerm) {
      const searchCondition = `
        WHERE (
          m.material_name LIKE ? OR
          m.category_name LIKE ? OR
          c.nama_customer LIKE ?
        )
      `;
      countQuery += searchCondition;
      query += searchCondition;
    }

    // Tambahkan ORDER BY ke query utama
    query += ` ORDER BY material_name ASC`;

    // Tambahkan LIMIT dan OFFSET ke query data
    const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      const searchParams = [searchPattern, searchPattern, searchPattern];

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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const pool = getPool();
    const { material_name, category_name, location, customer_id } = await req.json();

    const query = `
      INSERT INTO materials
      (material_name, category_name, location, customer_id, stock_ori_kg, stock_scrap_kg)
      VALUES (?, ?, ?, ?, 0, 0)
    `;

    await pool.execute(query, [
      material_name,
      category_name,
      location || '-',
      customer_id || null
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