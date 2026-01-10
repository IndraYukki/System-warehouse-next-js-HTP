import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const connection = await pool.getConnection(); // Gunakan koneksi manual untuk Transaction
  
  try {
    const { material_id, type, quantity_kg, description } = await req.json();
    
    await connection.beginTransaction();

    // 1. Simpan history transaksi
    await connection.execute(
      "INSERT INTO material_transactions (material_id, type, quantity_kg, description) VALUES (?, ?, ?, ?)",
      [material_id, type, quantity_kg, description]
    );

    // 2. Update saldo di tabel materials
    const updateQuery = type === 'IN' 
      ? "UPDATE materials SET stock_kg = stock_kg + ? WHERE id = ?"
      : "UPDATE materials SET stock_kg = stock_kg - ? WHERE id = ?";
    
    await connection.execute(updateQuery, [quantity_kg, material_id]);

    await connection.commit();
    return NextResponse.json({ message: "Transaksi Berhasil" });
  } catch (error: any) {
    await connection.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}