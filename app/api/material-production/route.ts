import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const { bom_id, qty_produced, scrap_percentage, po_number } = await req.json();
    
    await conn.beginTransaction();

    // 1. Ambil data BOM & Detail Material sekaligus
    const [bomRows]: any = await conn.execute(
      `SELECT mb.*, m.stock_kg 
       FROM material_bom mb 
       JOIN materials m ON mb.material_id = m.id 
       WHERE mb.id = ?`, 
      [bom_id]
    );

    if (bomRows.length === 0) throw new Error("Data BOM tidak ditemukan");
    const bom = bomRows[0];

    // 2. Kalkulasi Rumus Presisi
    const weightPerPcs = Number(bom.weight_part) + (Number(bom.weight_runner) / Number(bom.cavity));
    let totalUsedGr = weightPerPcs * Number(qty_produced);
    
    if (scrap_percentage > 0) {
      totalUsedGr = totalUsedGr * (1 + (Number(scrap_percentage) / 100));
    }

    const totalUsedKg = totalUsedGr / 1000;

    // 3. Logika History (Stock Initial & Final)
    const stockInitial = Number(bom.stock_kg);
    const stockFinal = stockInitial - totalUsedKg;

    // 4. Update Stok di Tabel Master
    await conn.execute(
      "UPDATE materials SET stock_kg = ? WHERE id = ?",
      [stockFinal, bom.material_id]
    );

    // 5. Catat ke Transaksi (Lengkap dengan No PO & Saldo)
    await conn.execute(
      `INSERT INTO material_transactions 
      (material_id, type, quantity, description, po_number, stock_initial, stock_final, qty_pcs) 
      VALUES (?, 'OUT', ?, ?, ?, ?, ?, ?)`,
      [
        bom.material_id, 
        totalUsedKg, 
        `Produksi ${qty_produced} pcs ${bom.product_name}`, 
        po_number || null, 
        stockInitial, 
        stockFinal, 
        qty_produced
      ]
    );

    await conn.commit();
    return NextResponse.json({ message: "Sukses", used: totalUsedKg });

  } catch (error: any) {
    await conn.rollback();
    console.error("PRODUCTION_ERROR:", error.message); // Cek log di terminal VSCode
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}