import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log("PUT request received for BOM ID:", params.id);

    const pool = getPool();
    const body = await req.json();
    console.log("Request body:", body);

    const {
      part_no, // Ini tidak akan di-update karena part_no adalah identifier unik
      product_name,
      product_category,
      product_color,
      material_id,
      weight_part,
      weight_runner,
      cavity
    } = body;

    const query = `
      UPDATE material_bom
      SET product_name = ?, product_category = ?, product_color = ?,
          material_id = ?, weight_part = ?, weight_runner = ?, cavity = ?
      WHERE id = ?
    `;

    console.log("Executing query:", query);
    console.log("With parameters:", [product_name, product_category, product_color, material_id, weight_part, weight_runner, cavity, params.id]);

    // Validasi dan konversi tipe data
    const validatedMaterialId = material_id ? parseInt(material_id) : null;
    const validatedWeightPart = weight_part ? parseFloat(weight_part) : 0;
    const validatedWeightRunner = weight_runner ? parseFloat(weight_runner) : 0;
    const validatedCavity = cavity ? parseInt(cavity) : 1;

    // Cek apakah konversi berhasil untuk nilai yang bukan null
    if (material_id && isNaN(validatedMaterialId)) {
      return NextResponse.json(
        { error: "material_id harus berupa angka yang valid" },
        { status: 400 }
      );
    }

    if (weight_part && isNaN(validatedWeightPart)) {
      return NextResponse.json(
        { error: "weight_part harus berupa angka yang valid" },
        { status: 400 }
      );
    }

    if (weight_runner && isNaN(validatedWeightRunner)) {
      return NextResponse.json(
        { error: "weight_runner harus berupa angka yang valid" },
        { status: 400 }
      );
    }

    if (cavity && isNaN(validatedCavity)) {
      return NextResponse.json(
        { error: "cavity harus berupa angka yang valid" },
        { status: 400 }
      );
    }

    const result = await pool.execute(query, [
      product_name || null,
      product_category || null,
      product_color || null,
      validatedMaterialId,
      validatedWeightPart,
      validatedWeightRunner,
      validatedCavity,
      params.id
    ]);

    console.log("Update result:", result);

    return NextResponse.json({
      message: "BOM berhasil diperbarui"
    });
  } catch (error: any) {
    console.error("Error updating BOM:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const pool = getPool();

    const deleteQuery = `
      DELETE FROM material_bom
      WHERE id = ?
    `;

    const [result]: any = await pool.execute(deleteQuery, [params.id]);
    console.log(`Deleted BOM ${params.id}, affected rows: ${result.affectedRows}`);

    return NextResponse.json({
      message: "BOM berhasil dihapus"
    });
  } catch (error: any) {
    console.error("Error deleting BOM:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}