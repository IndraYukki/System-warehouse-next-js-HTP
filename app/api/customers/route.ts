import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getPool();

    // Coba ambil data dengan nama kolom yang Anda berikan: nama_customer
    const [rows] = await pool.execute(`
      SELECT
        id,
        nama_customer
      FROM customers
      ORDER BY nama_customer ASC
    `);

    // Format data sesuai kebutuhan frontend
    const formattedRows = rows.map((row: any) => ({
      id: row.id,
      name: row.nama_customer  // Sesuaikan dengan nama field yang digunakan di frontend
    }));

    return NextResponse.json(formattedRows);
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}