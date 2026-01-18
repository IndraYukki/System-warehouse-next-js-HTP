import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const pool = getPool();
    const { location, stock_ori_kg, stock_scrap_kg } = await req.json();

    const query = `
      UPDATE materials
      SET location = ?, stock_ori_kg = ?, stock_scrap_kg = ?
      WHERE id = ?
    `;

    await pool.execute(query, [
      location,
      stock_ori_kg,
      stock_scrap_kg,
      params.id
    ]);

    return NextResponse.json({
      message: "Material berhasil diperbarui"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const pool = getPool();

    const query = `
      DELETE FROM materials
      WHERE id = ?
    `;

    await pool.execute(query, [params.id]);

    return NextResponse.json({
      message: "Material berhasil dihapus"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}