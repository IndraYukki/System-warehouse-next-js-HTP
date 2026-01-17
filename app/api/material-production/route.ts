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
    const [rows]: any = await conn.execute(
      `SELECT mb.*, m.id AS material_id, m.stock_kg
       FROM material_bom mb
       JOIN materials m ON mb.material_id = m.id
       WHERE mb.id = ?`,
      [bom_id]
    );

    if (rows.length === 0) {
      throw new Error("BOM tidak ditemukan");
    }

    const bom = rows[0];

    // 2️⃣ Hitung kebutuhan material
    const weightPerPcs =
      Number(bom.weight_part) +
      Number(bom.weight_runner) / Number(bom.cavity);

    const baseKg = (weightPerPcs * Number(qty_produced)) / 1000;
    const totalKg = baseKg * (1 + CUT_LOSS_PERCENT / 100);


    const oriKg = totalKg * (Number(ori_percent) / 100);
    const scrapKg = totalKg * ((100 - Number(ori_percent)) / 100);

    // 3️⃣ Ambil stok ORI & SCRAP
    const [stockRows]: any = await conn.execute(
      `SELECT material_status, stock_kg 
       FROM material_stock_status
       WHERE material_id = ?`,
      [bom.material_id]
    );

    const oriStock = stockRows.find((s: any) => s.material_status === "ORI");
    const scrapStock = stockRows.find((s: any) => s.material_status === "SCRAP");

    if (!oriStock || !scrapStock) {
      throw new Error("Stock ORI / SCRAP tidak lengkap");
    }

    if (oriStock.stock_kg < oriKg) {
      throw new Error("Stock ORI tidak mencukupi");
    }

    if (scrapStock.stock_kg < scrapKg) {
      throw new Error("Stock SCRAP tidak mencukupi");
    }

    // 4️⃣ Update stok ORI
    if (oriKg > 0) {
      await conn.execute(
        `UPDATE material_stock_status
         SET stock_kg = stock_kg - ?
         WHERE material_id = ? AND material_status = 'ORI'`,
        [oriKg, bom.material_id]
      );

      await conn.execute(
        `INSERT INTO material_transactions
        (material_id, bom_id, type, quantity, material_status, description, po_number, stock_initial, stock_final, qty_pcs)
        VALUES (?, ?, 'OUT', ?, 'ORI', ?, ?, ?, ?, ?)`,
        [
          bom.material_id,
          bom.id,
          oriKg,
          `Produksi ${qty_produced} pcs (${ori_percent}% ORI)`,
          po_number,
          oriStock.stock_kg,
          oriStock.stock_kg - oriKg,
          qty_produced
        ]
      );

    }

    // 5️⃣ Update stok SCRAP
    if (scrapKg > 0) {
      await conn.execute(
        `UPDATE material_stock_status
         SET stock_kg = stock_kg - ?
         WHERE material_id = ? AND material_status = 'SCRAP'`,
        [scrapKg, bom.material_id]
      );

      await conn.execute(
          `INSERT INTO material_transactions
          (material_id, bom_id, type, quantity, material_status, description, po_number, stock_initial, stock_final, qty_pcs)
          VALUES (?, ?, 'OUT', ?, 'SCRAP', ?, ?, ?, ?, ?)`,
          [
            bom.material_id,
            bom.id,
            scrapKg,
            `Produksi ${qty_produced} pcs (${100 - ori_percent}% SCRAP)`,
            po_number,
            scrapStock.stock_kg,
            scrapStock.stock_kg - scrapKg,
            qty_produced
          ]
        );


    }

    await conn.commit();

    return NextResponse.json({
      message: "Produksi berhasil",
      total_used_kg: totalKg,
      ori_used_kg: oriKg,
      scrap_used_kg: scrapKg
    });

  } catch (error: any) {
    await conn.rollback();
    console.error("PRODUCTION_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
