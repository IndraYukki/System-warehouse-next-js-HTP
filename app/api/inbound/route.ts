import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function POST(request: Request) {
  const pool = getPool()
  let connection

  try {
    const { part_no, alamat_rak, keterangan } = await request.json()

    // Validasi input
    if (!part_no || !alamat_rak) {
      return NextResponse.json({ error: "Part No dan Alamat Rak harus diisi!" }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 1. Cek apakah part_no terdaftar di master_parts
    const [partRows] = await connection.query("SELECT * FROM master_parts WHERE part_no = ?", [part_no])

    if ((partRows as any[]).length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Part No tidak terdaftar di Master Data!" }, { status: 400 })
    }

    // 2. Cek apakah alamat_rak tersedia (Empty)
    const [rackRows] = await connection.query("SELECT * FROM master_racks WHERE alamat_rak = ?", [alamat_rak])

    if ((rackRows as any[]).length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Alamat Rak tidak ditemukan!" }, { status: 400 })
    }

    const rack = (rackRows as any[])[0]
    if (rack.status === "Occupied") {
      await connection.rollback()
      return NextResponse.json({ error: "Rak sudah terisi! Pilih rak lain." }, { status: 400 })
    }

    // 3. Auto-timestamp menggunakan waktu server
    const waktuSekarang = new Date()

    // 4. Insert ke inventory (OTOMATIS TAMBAH BARANG)
    await connection.query("INSERT INTO inventory (part_no, alamat_rak, tgl_masuk) VALUES (?, ?, ?)", [
      part_no,
      alamat_rak,
      waktuSekarang,
    ])

    // 5. Update status rak menjadi Occupied
    await connection.query("UPDATE master_racks SET status = ? WHERE alamat_rak = ?", ["Occupied", alamat_rak])

    // 6. Catat ke history_logs
    await connection.query(
      "INSERT INTO history_logs (part_no, alamat_rak, tipe, waktu_kejadian, keterangan) VALUES (?, ?, ?, ?, ?)",
      [part_no, alamat_rak, "IN", waktuSekarang, keterangan || "Barang masuk"],
    )

    await connection.commit()

    return NextResponse.json({
      success: true,
      message: "Barang berhasil ditambahkan ke inventory!",
      data: {
        part_no,
        alamat_rak,
        tgl_masuk: waktuSekarang,
      },
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Error inbound:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
