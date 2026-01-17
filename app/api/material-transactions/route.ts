import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const {
      material_id,
      type,
      quantity,
      material_status,
      description,
      po_number
    } = await req.json();

    const qty = Number(quantity);
    if (qty <= 0) throw new Error("Quantity tidak valid");

    await connection.beginTransaction();

    const [rows]: any = await connection.execute(
      `
      SELECT stock_ori_kg, stock_scrap_kg
      FROM materials
      WHERE id = ?
      `,
      [material_id]
    );

    if (rows.length === 0) throw new Error("Material tidak ditemukan");

    let { stock_ori_kg, stock_scrap_kg } = rows[0];

    let newOri = Number(stock_ori_kg);
    let newScrap = Number(stock_scrap_kg);

    if (type === "IN") {
      if (material_status === "ORI") newOri += qty;
      else newScrap += qty;
    } else {
      if (material_status === "ORI") newOri -= qty;
      else newScrap -= qty;
    }

    // SIMPAN HISTORY
    await connection.execute(
      `
      INSERT INTO material_transactions
      (material_id,bom_id, type, quantity, material_status, description, po_number)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        material_id,
        bom.id,
        type,
        qty,
        material_status,
        description,
        po_number
      ]
    );

    // UPDATE STOCK
    await connection.execute(
      `
      UPDATE materials
      SET stock_ori_kg = ?, stock_scrap_kg = ?
      WHERE id = ?
      `,
      [newOri, newScrap, material_id]
    );

    await connection.commit();

    return NextResponse.json({
      message: "Transaksi berhasil",
      stock_ori_kg: newOri,
      stock_scrap_kg: newScrap
    });

  } catch (error: any) {
    await connection.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}
