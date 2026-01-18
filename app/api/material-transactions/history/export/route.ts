import { getPool } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const searchTerm = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const pool = await getPool();

    let query = `
      SELECT
        mt.id,
        mt.po_number,
        mt.type,
        mt.material_status,
        mt.quantity,
        mt.qty_pcs,
        mt.stock_initial,
        mt.stock_final,
        mt.created_at,

        mb.part_no,
        mb.product_name,
        mb.product_color,

        mat.material_name,
        mat.category_name,
        c.nama_customer AS customer_name
      FROM material_transactions mt
      LEFT JOIN material_bom mb ON mt.bom_id = mb.id
      LEFT JOIN materials mat ON mt.material_id = mat.id
      LEFT JOIN customers c ON mat.customer_id = c.id
    `;

    const conditions = [];
    const baseParams: any[] = []; // Parameter untuk query dasar (tanpa LIMIT/OFFSET)

    if (searchTerm) {
      conditions.push(`
        (mb.part_no LIKE ? OR
         mb.product_name LIKE ? OR
         mat.material_name LIKE ? OR
         mt.po_number LIKE ?)
      `);
      const p = `%${searchTerm}%`;
      baseParams.push(p, p, p, p);
    }

    if (startDate && endDate) {
      conditions.push(`DATE(mt.created_at) BETWEEN ? AND ?`);
      baseParams.push(startDate, endDate);
    } else if (startDate) {
      conditions.push(`DATE(mt.created_at) >= ?`);
      baseParams.push(startDate);
    } else if (endDate) {
      conditions.push(`DATE(mt.created_at) <= ?`);
      baseParams.push(endDate);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY mt.created_at DESC`;

    const [rows]: any = await pool.query(query, baseParams);

    // Konversi data ke format CSV
    const DELIMITER = ';';

    if (rows.length === 0) {
      // Jika tidak ada data, kembalikan CSV kosong dengan header
      const csvHeader = [
        'Customer',
        'No. PO / Ref',
        'Status',
        'Part No (OUT)',
        'Nama Part & Warna (OUT)',
        'Material & Kategori',
        'Status Material',
        'Qty (Pcs)',
        'Trans (g/kg)',
        'Awal (g/kg)',
        'Akhir (g/kg)',
        'Waktu'
      ].join(DELIMITER);

      const csvContent = csvHeader;

      const headers = new Headers();
      headers.set('Content-Type', 'text/csv; charset=utf-8');
      headers.set('Content-Disposition', 'attachment; filename="material-history.csv"');

      const BOM = '\uFEFF';
      return new NextResponse(BOM + csvContent, {
        headers,
      });
    }

    // Buat header CSV
    const csvHeader = [
      'Customer',
      'No. PO / Ref',
      'Status',
      'Part No (OUT)',
      'Nama Part & Warna (OUT)',
      'Material & Kategori',
      'Status Material',
      'Qty (Pcs)',
      'Trans (gram)',
      'Awal (gram)',
      'Akhir (gram)',
      'Waktu'
    ].join(DELIMITER);

    // Buat baris CSV dari data
    const csvRows = rows.map((row: any) => {
      // Logika Konversi ke Gram untuk Display (seperti di UI)
      const transGram = Number(row.quantity || 0) * 1000;
      const initialGram = Number(row.stock_initial || 0) * 1000;
      const finalGram = Number(row.stock_final || 0) * 1000;

      // Format informasi untuk kolom-kolom tertentu
      const namaPartWarna = row.type === 'OUT'
        ? `${row.product_name || 'Production'} / ${row.product_color || '-'}`
        : 'Inbound Material';

      const materialKategori = `${row.material_name} / ${row.category_name || '-'}`;

      const values = [
        row.customer_name || '-', // Customer
        row.po_number || '-', // No. PO / Ref
        row.type, // Status
        row.type === 'OUT' ? (row.part_no || 'N/A') : '-', // Part No (OUT)
        namaPartWarna, // Nama Part & Warna (OUT)
        materialKategori, // Material & Kategori
        row.material_status, // Status Material
        row.qty_pcs || '-', // Qty (Pcs)
        transGram.toLocaleString('id-ID', { useGrouping: true }), // Trans (gram) - hanya nilai gram
        initialGram.toLocaleString('id-ID', { useGrouping: true }), // Awal (gram) - hanya nilai gram
        finalGram.toLocaleString('id-ID', { useGrouping: true }), // Akhir (gram) - hanya nilai gram
        new Date(row.created_at).toLocaleString('id-ID') // Waktu
      ].map(value => String(value).replace(/"/g, '""')); // Escape quotes only

      return values.join(DELIMITER);
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv; charset=utf-8');
    headers.set('Content-Disposition', 'attachment; filename="material-history.csv"');

    const BOM = '\uFEFF';
    return new NextResponse(BOM + csvContent, {
      headers,
    });
  } catch (err: any) {
    console.error("HISTORY_ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
