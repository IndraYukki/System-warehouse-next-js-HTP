import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const pool = getPool();
  const { searchParams } = new URL(request.url);
  const part_no = searchParams.get("part_no");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  try {
    // Validasi format tanggal
    let validatedStartDate = null;
    let validatedEndDate = null;

    if (startDate) {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Format tanggal mulai tidak valid. Gunakan format YYYY-MM-DD." }, { status: 400 });
      }
      validatedStartDate = date.toISOString().split('T')[0];
    }

    if (endDate) {
      const date = new Date(endDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Format tanggal akhir tidak valid. Gunakan format YYYY-MM-DD." }, { status: 400 });
      }
      validatedEndDate = date.toISOString().split('T')[0];
    }

    // Query untuk mendapatkan data inbound lengkap
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
        i.keterangan
      FROM inbound i
      LEFT JOIN master_parts mp ON i.part_no = mp.part_no
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN master_racks mr ON i.alamat_rak = mr.alamat_rak
    `;

    const params: any[] = [];
    let whereClauseAdded = false;

    // Tambahkan filter jika part_no disediakan
    if (part_no) {
      query += " WHERE i.part_no LIKE ?";
      params.push(`%${part_no}%`);
      whereClauseAdded = true;
    }

    // Tambahkan filter tanggal jika disediakan
    if (validatedStartDate && validatedEndDate) {
      query += whereClauseAdded ? " AND i.tgl_masuk BETWEEN ? AND ?" : " WHERE i.tgl_masuk BETWEEN ? AND ?";
      params.push(`${validatedStartDate} 00:00:00`, `${validatedEndDate} 23:59:59`);
      whereClauseAdded = true;
    } else if (validatedStartDate) {
      query += whereClauseAdded ? " AND i.tgl_masuk >= ?" : " WHERE i.tgl_masuk >= ?";
      params.push(`${validatedStartDate} 00:00:00`);
      whereClauseAdded = true;
    } else if (validatedEndDate) {
      query += whereClauseAdded ? " AND i.tgl_masuk <= ?" : " WHERE i.tgl_masuk <= ?";
      params.push(`${validatedEndDate} 23:59:59`);
      whereClauseAdded = true;
    } else {
      // Jika tidak ada filter tanggal, gunakan default 1 minggu terakhir
      query += whereClauseAdded ? " AND i.tgl_masuk >= DATE_SUB(NOW(), INTERVAL 1 WEEK)" : " WHERE i.tgl_masuk >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
    }

    query += " ORDER BY i.tgl_masuk DESC";

    const [rows]: any = await pool.query(query, params);
    console.log(`Found ${rows.length} rows for inbound export`);

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
        "ID": item.id,
        "Part No": item.part_no,
        "Nama Part": item.nama_part,
        "Customer": item.nama_customer || "Tidak Ada Customer",
        "Alamat Rak": item.alamat_rak,
        "Zona": item.zona,
        "Jumlah": item.jumlah,
        "Tanggal Masuk": tanggalMasuk,
        "Keterangan": item.keterangan,
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
    let filename = "inbound_export.csv";
    if (part_no) {
      filename = `inbound_export_${part_no.replace(/[\\/?*[\]:]/g, '_')}.csv`;
    } else if (validatedStartDate && validatedEndDate) {
      filename = `inbound_export_${validatedStartDate}_to_${validatedEndDate}.csv`;
    } else if (validatedStartDate) {
      filename = `inbound_export_${validatedStartDate}.csv`;
    } else if (validatedEndDate) {
      filename = `inbound_export_${validatedEndDate}.csv`;
    } else {
      filename = "inbound_export_recent.csv";
    }

    // Return file CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting inbound:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.json({ error: "Gagal mengekspor data inbound: " + error.message }, { status: 500 });
  }
}