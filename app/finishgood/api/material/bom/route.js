import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
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

        await db.execute(query, [product_id, material_id, weight_part, weight_runner, cavity]);
        
        return NextResponse.json({ message: "BOM Berhasil disimpan" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}