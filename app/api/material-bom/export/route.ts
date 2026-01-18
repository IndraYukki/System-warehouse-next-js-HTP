import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const pool = await getPool();

    // Query untuk mengambil semua data BOM
    const query = `
      SELECT
        mb.id,
        mb.part_no,
        mb.product_name,
        mb.product_color,
        m.material_name,
        mb.weight_part,
        mb.weight_runner,
        mb.cavity
      FROM material_bom mb
      LEFT JOIN materials m ON mb.material_id = m.id
      ORDER BY mb.part_no
    `;

    const [rows]: any = await pool.query(query);

    // Konversi data ke format CSV
    const DELIMITER = ';';
    
    if (rows.length === 0) {
      // Jika tidak ada data, kembalikan CSV kosong dengan header
      const csvHeader = [
        'ID',
        'Part No',
        'Nama Produk',
        'Warna',
        'Material',
        'Part (g)',
        'Runner (g)',
        'Cavity'
      ].join(DELIMITER);

      const csvContent = csvHeader;
      
      const headers = new Headers();
      headers.set('Content-Type', 'text/csv; charset=utf-8');
      headers.set('Content-Disposition', 'attachment; filename="master-bom.csv"');
      
      const BOM = '\uFEFF';
      return new NextResponse(BOM + csvContent, {
        headers,
      });
    }

    // Buat header CSV sesuai dengan urutan kolom di UI
    const csvHeader = [
      'ID',
      'Part No',
      'Nama Produk',
      'Warna',
      'Material',
      'Part (g)',
      'Runner (g)',
      'Cavity'
    ].join(DELIMITER);

    // Buat baris CSV dari data
    const csvRows = rows.map((row: any) => {
      const values = [
        row.id || '', // ID
        row.part_no || '-', // Part No
        row.product_name || '-', // Nama Produk
        row.product_color || '-', // Warna
        row.material_name || '-', // Material
        row.weight_part || '', // Part (g)
        row.weight_runner || '', // Runner (g)
        row.cavity || '' // Cavity
      ].map(value => String(value).replace(/"/g, '""')); // Escape quotes
      
      return values.join(DELIMITER);
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', 'attachment; filename="master-bom.csv"');
    
    const BOM = '\uFEFF';
    return new NextResponse(BOM + csvContent, {
      headers,
    });
  } catch (err: any) {
    console.error("EXPORT_ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}