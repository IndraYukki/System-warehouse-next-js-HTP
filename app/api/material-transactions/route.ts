import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const connection = await pool.getConnection(); // Gunakan connection untuk Transaction
  
  try {
    const { material_id, type, quantity, description } = await req.json();
    
    await connection.beginTransaction(); // Mulai proses transaksi database

    // 1. Catat di history transaksi
    const insertQuery = `INSERT INTO material_transactions (material_id, type, quantity, description) VALUES (?, ?, ?, ?)`;
    await connection.execute(insertQuery, [material_id, type, quantity, description]);

    // 2. Update Stok di tabel materials
    const updateQuery = type === 'IN' 
      ? `UPDATE materials SET stock_kg = stock_kg + ? WHERE id = ?`
      : `UPDATE materials SET stock_kg = stock_kg - ? WHERE id = ?`;
    
    await connection.execute(updateQuery, [quantity, material_id]);

    await connection.commit(); // Simpan permanen
    return NextResponse.json({ message: "Transaksi Stok Berhasil" });
  } catch (error: any) {
    await connection.rollback(); // Batalkan jika ada error
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}