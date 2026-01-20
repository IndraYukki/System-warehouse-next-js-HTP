import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const pool = await getPool();

    // Query untuk mengambil semua data material
    const query = `
      SELECT
        m.id,
        m.material_name,
        m.category_name,
        m.location,
        c.nama_customer AS customer_name,
        m.stock_ori_kg,
        m.stock_scrap_kg
      FROM materials m
      LEFT JOIN customers c ON m.customer_id = c.id
      ORDER BY m.material_name
    `;

    const [rows]: any = await pool.query(query);

    // Konversi data ke format CSV
    const DELIMITER = ',';

    if (rows.length === 0) {
      // Jika tidak ada data, kembalikan CSV kosong dengan header
      const csvHeader = [
        'Nama Material',
        'Kategori',
        'Lokasi',
        'Customer',
        'ORI (gram)',
        'SCRAP (gram)',
        'TOTAL (gram)'
      ].join(DELIMITER);

      const csvContent = csvHeader;

      const headers = new Headers();
      headers.set('Content-Type', 'text/csv; charset=utf-8');
      headers.set('Content-Disposition', 'attachment; filename="material-inventory.csv"');

      const BOM = '\uFEFF';
      const sepLine = 'sep=,\n'; // Baris untuk memberi tahu Excel bahwa pemisah kolom adalah koma
      return new NextResponse(BOM + sepLine + csvContent, {
        headers,
      });
    }

    // Buat header CSV sesuai dengan urutan kolom di UI
    const csvHeader = [
      'Nama Material',
      'Kategori',
      'Lokasi',
      'Customer',
      'ORI (gram)',
      'SCRAP (gram)',
      'TOTAL (gram)'
    ].join(DELIMITER);

    // Buat baris CSV dari data
    const csvRows = rows.map((row: any) => {
      // Konversi ke gram (1 kg = 1000 g)
      const oriGram = Number(row.stock_ori_kg || 0) * 1000;
      const scrapGram = Number(row.stock_scrap_kg || 0) * 1000;
      const totalGram = (Number(row.stock_ori_kg || 0) + Number(row.stock_scrap_kg || 0)) * 1000;

      const values = [
        row.material_name || '-', // Nama Material
        row.category_name || '-', // Kategori
        row.location || '-', // Lokasi
        row.customer_name || '-', // Customer
        oriGram.toLocaleString('id-ID', { useGrouping: true }), // ORI (gram)
        scrapGram.toLocaleString('id-ID', { useGrouping: true }), // SCRAP (gram)
        totalGram.toLocaleString('id-ID', { useGrouping: true }) // TOTAL (gram)
      ].map(value => {
        // Escape quotes dan wrap value in quotes if it contains commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });

      return values.join(DELIMITER);
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', 'attachment; filename="material-inventory.csv"');

    const BOM = '\uFEFF';
    const sepLine = 'sep=,\n'; // Baris untuk memberi tahu Excel bahwa pemisah kolom adalah koma
    return new NextResponse(BOM + sepLine + csvContent, {
      headers,
    });
  } catch (err: any) {
    console.error("EXPORT_ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}