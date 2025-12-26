import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  const { searchParams } = new URL(request.url);
  const part_no = searchParams.get("part_no");

  try {
    // Query untuk mendapatkan data history lengkap
    let query = `
      SELECT
        hl.id,
        hl.waktu_kejadian,
        c.nama_customer,
        hl.part_no,
        mp.nama_part,
        hl.alamat_rak,
        hl.tipe,
        hl.jumlah,
        hl.keterangan,
        hl.total_awal,
        hl.total_akhir
      FROM history_logs hl
      LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
      LEFT JOIN customers c ON hl.customer_id = c.id
    `;

    const params: any[] = [];

    // Tambahkan filter jika part_no disediakan
    if (part_no) {
      query += " WHERE hl.part_no LIKE ?";
      params.push(`%${part_no}%`);
    } else {
      // Jika tidak ada pencarian part_no, tambahkan filter 1 minggu terakhir
      query += " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
    }

    query += " ORDER BY hl.waktu_kejadian DESC";

    const [rows]: any = await pool.query(query, params);
    console.log(`Found ${rows.length} rows for history export`);

    // Format data untuk CSV
    const csvData = rows.map((item: any) => {
      // Pastikan waktu_kejadian adalah string yang valid sebelum dikonversi
      let waktuKejadian = "Tidak Valid";
      try {
        waktuKejadian = new Date(item.waktu_kejadian).toLocaleString('id-ID');
      } catch (e) {
        console.warn("Invalid date format:", item.waktu_kejadian);
      }
      
      return {
        "Waktu": waktuKejadian,
        "Customer": item.nama_customer || "Tidak Ada Customer",
        "Part No": item.part_no,
        "Nama Part": item.nama_part,
        "Rak": item.alamat_rak,
        "Tipe": item.tipe,
        "Jumlah": item.jumlah,
        "Keterangan": item.keterangan,
        "Total Awal": item.total_awal,
        "Total Akhir": item.total_akhir,
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
    let filename = "history_transaksi_export.csv";
    if (part_no) {
      filename = `history_transaksi_export_${part_no.replace(/[\\/?*[\]:]/g, '_')}.csv`;
    }

    // Return file CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting history:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.json({ error: "Gagal mengekspor data history: " + error.message }, { status: 500 });
  }
}