import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();
  const CUT_LOSS_PERCENT = 3;

  try {
    const {
      bom_id,
      qty_produced,
      ori_percent,
      po_number
    } = await req.json();

    await conn.beginTransaction();

    // 1️⃣ Ambil BOM + Material
    const [rows]: any = await conn.execute(`
      SELECT 
        mb.id AS bom_id,
        mb.part_no,
        mb.product_name,
        mb.weight_part,
        mb.weight_runner,
        mb.cavity,
        m.id AS material_id,
        m.stock_ori_kg,
        m.stock_scrap_kg
      FROM material_bom mb
      JOIN materials m ON mb.material_id = m.id
      WHERE mb.id = ?
    `, [bom_id]);

    if (!rows.length) throw new Error("BOM tidak ditemukan");

    const bom = rows[0];

    // 2️⃣ Hitung kebutuhan material
    const weightPerPcs =
      Number(bom.weight_part) +
      Number(bom.weight_runner) / Number(bom.cavity);

    const baseKg = (weightPerPcs * qty_produced) / 1000;
    const totalKg = baseKg * (1 + CUT_LOSS_PERCENT / 100);

    const oriKg   = totalKg * (ori_percent / 100);
    const scrapKg = totalKg * ((100 - ori_percent) / 100);


    // 4️⃣ Update stock materials
    await conn.execute(`
      UPDATE materials
      SET 
        stock_ori_kg = stock_ori_kg - ?,
        stock_scrap_kg = stock_scrap_kg - ?
      WHERE id = ?
    `, [oriKg, scrapKg, bom.material_id]);

    // 5️⃣ History ORI
    if (oriKg > 0) {
      await conn.execute(`
        INSERT INTO material_transactions
        (material_id, bom_id, material_status, type,
         quantity, stock_initial, stock_final,
         qty_pcs, description, po_number)
        VALUES (?, ?, 'ORI', 'OUT', ?, ?, ?, ?, ?, ?)
      `, [
        bom.material_id,
        bom.bom_id,
        oriKg,
        bom.stock_ori_kg,
        bom.stock_ori_kg - oriKg,
        qty_produced,
        `Produksi ${bom.part_no} - ${bom.product_name}`,
        po_number
      ]);
    }

    // 6️⃣ History SCRAP
    if (scrapKg > 0) {
      await conn.execute(`
        INSERT INTO material_transactions
        (material_id, bom_id, material_status, type,
         quantity, stock_initial, stock_final,
         qty_pcs, description, po_number)
        VALUES (?, ?, 'SCRAP', 'OUT', ?, ?, ?, ?, ?, ?)
      `, [
        bom.material_id,
        bom.bom_id,
        scrapKg,
        bom.stock_scrap_kg,
        bom.stock_scrap_kg - scrapKg,
        qty_produced,
        `Produksi ${bom.part_no} - ${bom.product_name}`,
        po_number
      ]);
    }

    await conn.commit();

    return NextResponse.json({
      message: "Produksi berhasil",
      total_used_kg: totalKg,
      ori_used_kg: oriKg,
      scrap_used_kg: scrapKg
    });

  } catch (err: any) {
    await conn.rollback();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
