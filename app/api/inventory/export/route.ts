import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  const { searchParams } = new URL(request.url);
  const customer = searchParams.get("customer"); // Parameter untuk filter berdasarkan customer

  try {
    // Query untuk mendapatkan data inventory lengkap
    let query = `
      SELECT
        i.id,
        i.part_no,
        mp.nama_part,
        c.nama_customer,
        i.alamat_rak,
        mr.zona,
        i.jumlah,
        i.tgl_masuk,
        totals.total_jumlah
      FROM inventory i
      LEFT JOIN master_parts mp ON i.part_no = mp.part_no
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN master_racks mr ON i.alamat_rak = mr.alamat_rak
      LEFT JOIN (
        SELECT
          part_no,
          SUM(jumlah) as total_jumlah
        FROM inventory
        GROUP BY part_no
      ) totals ON i.part_no = totals.part_no
    `;

    const params: any[] = [];

    if (customer && customer !== "all") {
      query += " WHERE c.nama_customer = ?";
      params.push(customer);
    }

    query += " ORDER BY c.nama_customer, i.tgl_masuk DESC";

    const [rows]: any = await pool.query(query, params);
    console.log(`Found ${rows.length} rows for export`);

    // Format data untuk CSV
    const csvData = rows.map((item: any) => {
      // Pastikan tgl_masuk adalah string yang valid sebelum dikonversi
      let tanggalMasuk = "Tidak Valid";
      try {
        tanggalMasuk = new Date(item.tgl_masuk).toLocaleString('id-ID');
      } catch (e) {
        console.warn("Invalid date format:", item.tgl_masuk);
      }

      return {
        "Customer": item.nama_customer || "Tidak Ada Customer",
        "Part No": item.part_no,
        "Nama Part": item.nama_part,
        "Alamat Rak": item.alamat_rak,
        "Zona": item.zona,
        "Jumlah": item.jumlah,
        "Total Jumlah": item.total_jumlah,
        "Tanggal Masuk": tanggalMasuk,
        "ID": item.id,
      };
    });

    // Membuat header CSV
    const headers = Object.keys(csvData[0] || {});
    const csvHeader = headers.join(',');

    // Membuat baris data CSV
    const csvRows = csvData.map((row: any) => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes dan wrap value in quotes if it contains commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    // Gabungkan header dan baris data dengan penambahan sep=, di awal dan BOM
    const bom = '\uFEFF'; // UTF-8 BOM
    const sepLine = 'sep=,\n'; // Baris untuk memberi tahu Excel bahwa pemisah kolom adalah koma
    const csvContent = bom + sepLine + [csvHeader, ...csvRows].join('\n');

    // Menentukan nama file berdasarkan parameter
    let filename = "inventory_export.csv";
    if (customer && customer !== "all") {
      filename = `inventory_export_${customer.replace(/[\\/?*[\]:]/g, '_')}.csv`;
    } else if (customer === "all") {
      filename = "inventory_export_per_customer.csv"; // Untuk menunjukkan bahwa ini adalah data dari semua customer
    }

    // Return file CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting inventory:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.json({ error: "Gagal mengekspor data inventory: " + error.message }, { status: 500 });
  }
}