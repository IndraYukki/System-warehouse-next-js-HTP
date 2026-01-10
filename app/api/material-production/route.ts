import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const { bom_id, qty_produced, scrap_percentage } = await req.json();
    await conn.beginTransaction();

    // 1. Ambil detail data BOM (Resep)
    const [bomRows]: any = await conn.execute(
      "SELECT * FROM material_bom WHERE id = ?", [bom_id]
    );
    const bom = bomRows[0];

    // 2. HITUNG SESUAI RUMUS YANG KITA SEPAKATI
    // Berat per Pcs = Part + (Runner / Cavity)
    const weightPerPcs = Number(bom.weight_part) + (Number(bom.weight_runner) / bom.cavity);
    
    // Total dalam gram
    let totalUsedGr = weightPerPcs * qty_produced;
    
    // Tambahkan faktor Scrap/Waste
    if (scrap_percentage > 0) {
      totalUsedGr = totalUsedGr * (1 + (scrap_percentage / 100));
    }

    // Konversi ke Kg
    const totalUsedKg = totalUsedGr / 1000;

    // 3. POTONG STOK MATERIAL UTAMA
    await conn.execute(
      "UPDATE materials SET stock_kg = stock_kg - ? WHERE id = ?",
      [totalUsedKg, bom.material_id]
    );

    // 4. CATAT DI HISTORY TRANSAKSI GUDANG (Agar muncul di log keluar)
    await conn.execute(
      "INSERT INTO material_transactions (material_id, type, quantity, description) VALUES (?, 'OUT', ?, ?)",
      [bom.material_id, totalUsedKg, `Produksi ${qty_produced} pcs ${bom.product_name} (Part No: ${bom.part_no})`]
    );

    // 5. SIMPAN LAPORAN PRODUKSI
    await conn.execute(
      "INSERT INTO material_production_reports (bom_id, qty_produced, scrap_percentage, total_material_used) VALUES (?, ?, ?, ?)",
      [bom_id, qty_produced, scrap_percentage, totalUsedKg]
    );

    await conn.commit();
    return NextResponse.json({ message: "Sukses! Stok otomatis terpotong", total_used: totalUsedKg });

  } catch (error: any) {
    await conn.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}