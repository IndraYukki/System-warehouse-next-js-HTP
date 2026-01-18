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
      FROM material_bom mb
      JOIN materials m ON mb.material_id = m.id
    `;

    // Query untuk mengambil data
    let query = `
      SELECT
      mb.id,
      mb.part_no,
      mb.product_name,
      mb.product_color,
      mb.weight_part,
      mb.weight_runner,
      mb.cavity,
      m.material_name,
      m.category_name,
      m.stock_ori_kg,
      m.stock_scrap_kg
    FROM material_bom mb
    JOIN materials m ON mb.material_id = m.id
    `;

    // Tambahkan kondisi pencarian jika searchTerm ada
    if (searchTerm) {
      const searchCondition = `
        WHERE (
          mb.part_no LIKE ? OR
          mb.product_name LIKE ? OR
          m.material_name LIKE ? OR
          m.category_name LIKE ?
        )
      `;
      countQuery += searchCondition;
      query += searchCondition;
    }

    // Tambahkan ORDER BY ke query utama
    query += ` ORDER BY mb.part_no`;

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