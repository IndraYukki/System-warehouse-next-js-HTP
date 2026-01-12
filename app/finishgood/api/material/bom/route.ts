import { pool } from "@/lib/db"; // Ganti 'pool' sesuai nama export di lib/db.ts kamu
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { product_id, material_id, weight_part, weight_runner, cavity } = body;

        const query = `
            INSERT INTO material_bom (product_id, material_id, weight_part, weight_runner, cavity)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            material_id = VALUES(material_id),
            weight_part = VALUES(weight_part),
            weight_runner = VALUES(weight_runner),
            cavity = VALUES(cavity)
        `;

        // Gunakan pool.execute jika menggunakan library mysql2
        await pool.execute(query, [product_id, material_id, weight_part, weight_runner, cavity]);
        
        return NextResponse.json({ message: "BOM Berhasil disimpan" });
    } catch (error: any) {
        console.error("BOM Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}