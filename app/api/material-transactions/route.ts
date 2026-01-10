import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const connection = await pool.getConnection(); 
  
  try {
    // Tambahkan po_number ke dalam destrukturisasi
    const { material_id, type, quantity, description, po_number } = await req.json();
    
    await connection.beginTransaction(); 

    // 1. Ambil stok awal sebelum transaksi dilakukan
    const [materialRows]: any = await connection.execute(
      "SELECT stock_kg FROM materials WHERE id = ?", [material_id]
    );
    
    if (materialRows.length === 0) {
      throw new Error("Material tidak ditemukan");
    }

    const stockInitial = Number(materialRows[0].stock_kg);
    const transQty = Number(quantity);
    
    // 2. Hitung stok akhir berdasarkan tipe IN atau OUT
    const stockFinal = type === 'IN' 
      ? stockInitial + transQty 
      : stockInitial - transQty;

    // 3. Simpan ke history transaksi (dengan kolom-kolom baru)
    const insertQuery = `
      INSERT INTO material_transactions 
      (material_id, type, quantity, description, po_number, stock_initial, stock_final) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(insertQuery, [
      material_id, 
      type, 
      transQty, 
      description, 
      po_number || null, 
      stockInitial, 
      stockFinal
    ]);

    // 4. Update stok di tabel master materials
    const updateQuery = `UPDATE materials SET stock_kg = ? WHERE id = ?`;
    await connection.execute(updateQuery, [stockFinal, material_id]);

    await connection.commit(); 
    return NextResponse.json({ 
      message: "Transaksi Stok Berhasil",
      initial: stockInitial,
      final: stockFinal 
    });

  } catch (error: any) {
    await connection.rollback(); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}