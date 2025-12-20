import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function POST(request: Request) {
  const pool = getPool()
  let connection

  try {
    const { part_no, keterangan } = await request.json()

    // Validasi input
    if (!part_no) {
      return NextResponse.json({ error: "Part No harus diisi!" }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 1. Cari barang di inventory (OTOMATIS CARI LOKASI)
    const [inventoryRows] = await connection.query("SELECT * FROM inventory WHERE part_no = ? LIMIT 1", [part_no])

    if ((inventoryRows as any[]).length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Barang tidak ditemukan di inventory!" }, { status: 400 })
    }

    const item = (inventoryRows as any[])[0]
    const alamat_rak = item.alamat_rak

    // 2. Auto-timestamp menggunakan waktu server
    const waktuSekarang = new Date()

    // 3. Hapus dari inventory (OTOMATIS KURANGI BARANG)
    await connection.query("DELETE FROM inventory WHERE id = ?", [item.id])

    // 4. Update status rak menjadi Empty
    await connection.query("UPDATE master_racks SET status = ? WHERE alamat_rak = ?", ["Empty", alamat_rak])

    // 5. Catat ke history_logs
    await connection.query(
      "INSERT INTO history_logs (part_no, alamat_rak, tipe, waktu_kejadian, keterangan) VALUES (?, ?, ?, ?, ?)",
      [part_no, alamat_rak, "OUT", waktuSekarang, keterangan || "Barang keluar"],
    )

    await connection.commit()

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dikeluarkan dari inventory!",
      data: {
        part_no,
        alamat_rak,
        tgl_keluar: waktuSekarang,
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Error outbound:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
