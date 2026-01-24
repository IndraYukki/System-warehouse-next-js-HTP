import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const {
      material_id,
      material_status,
      type, // IN | OUT
      quantity,
      description,
      po_number
    } = await req.json();

    await conn.beginTransaction();

    const [rows]: any = await conn.execute(
      `SELECT stock_ori_kg, stock_scrap_kg
       FROM materials
       WHERE id = ?`,
      [material_id]
    );

    if (!rows.length) {
      throw new Error("Material tidak ditemukan");
    }

    let stockOri = Number(rows[0].stock_ori_kg || 0);
    let stockScrap = Number(rows[0].stock_scrap_kg || 0);

    const stockInitial =
      material_status === "ORI" ? stockOri : stockScrap;

    // === LOGIC IN / OUT ===
    if (type === "IN") {
      if (material_status === "ORI") stockOri += quantity;
      else stockScrap += quantity;
    }

    if (type === "OUT") {
      if (material_status === "ORI") stockOri -= quantity;
      else stockScrap -= quantity;
    }

    const stockFinal =
      material_status === "ORI" ? stockOri : stockScrap;

    // update materials
    await conn.execute(
      `UPDATE materials
       SET stock_ori_kg = ?, stock_scrap_kg = ?
       WHERE id = ?`,
      [stockOri, stockScrap, material_id]
    );

    // insert history
    await conn.execute(
      `INSERT INTO material_transactions
       (material_id, material_status, type, quantity,
        stock_initial, stock_final, description, po_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        material_id,
        material_status,
        type,
        quantity,
        stockInitial,
        stockFinal,
        description,
        po_number
      ]
    );

    await conn.commit();

    return NextResponse.json({
      message: type === "IN"
        ? "Inbound berhasil"
        : "Shipping berhasil"
    });

  } catch (err: any) {
    await conn.rollback();
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
