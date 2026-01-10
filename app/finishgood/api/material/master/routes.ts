import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const pool = getPool();
        const [rows] = await pool.execute("SELECT * FROM material_master ORDER BY material_name ASC");
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { material_code, material_name } = await req.json();
        const pool = getPool();
        await pool.execute(
            "INSERT INTO material_master (material_code, material_name) VALUES (?, ?)",
            [material_code, material_name]
        );
        return NextResponse.json({ message: "Material berhasil ditambahkan" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}