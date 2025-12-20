import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function POST(request: Request) {
  const pool = getPool()
  let connection

  try {
    const { part_no, alamat_rak, jumlah: jumlahInput, keterangan } = await request.json()

    // Validasi input
    if (!part_no || !alamat_rak) {
      return NextResponse.json({ error: "Part No dan Alamat Rak harus diisi!" }, { status: 400 })
    }

    // Validasi jumlah
    const jumlah = jumlahInput ? parseInt(jumlahInput) : 1
    if (isNaN(jumlah) || jumlah <= 0) {
      return NextResponse.json({ error: "Jumlah harus berupa angka positif!" }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // Ambil customer_id dari master_parts
    const [partCustomerRows] = await connection.query(
      "SELECT customer_id FROM master_parts WHERE part_no = ?",
      [part_no]
    )

    const customer_id = (partCustomerRows as any[])[0]?.customer_id || null

    // 1. Cek apakah part_no terdaftar di master_parts
    const [partRows] = await connection.query("SELECT * FROM master_parts WHERE part_no = ?", [part_no])

    if ((partRows as any[]).length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Part No tidak terdaftar di Master Data!" }, { status: 400 })
    }

    // 2. Cek apakah alamat_rak tersedia
    const [rackRows] = await connection.query("SELECT * FROM master_racks WHERE alamat_rak = ?", [alamat_rak])

    if ((rackRows as any[]).length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Alamat Rak tidak ditemukan!" }, { status: 400 })
    }

    // 3. Cek apakah part_no sudah ada di inventory dengan alamat_rak yang sama
    const [existingInventoryRows] = await connection.query(
      "SELECT * FROM inventory WHERE part_no = ? AND alamat_rak = ?",
      [part_no, alamat_rak]
    )

    const waktuSekarang = new Date()
    let jumlahAkhir = jumlah // Jumlah yang akan dimasukkan

    if ((existingInventoryRows as any[]).length > 0) {
      // Jika sudah ada, tambahkan jumlahnya (update qty)
      const existingItem = (existingInventoryRows as any[])[0]
      jumlahAkhir = existingItem.jumlah + jumlah
      await connection.query(
        "UPDATE inventory SET jumlah = ?, tgl_masuk = ?, updated_at = ?, customer_id = ? WHERE id = ?",
        [jumlahAkhir, waktuSekarang, waktuSekarang, customer_id, existingItem.id]
      )
    } else {
      // Jika belum ada, buat baru
      await connection.query(
        "INSERT INTO inventory (part_no, alamat_rak, customer_id, jumlah, tgl_masuk, keterangan) VALUES (?, ?, ?, ?, ?, ?)",
        [part_no, alamat_rak, customer_id, jumlah, waktuSekarang, keterangan || "Barang masuk"]
      )
    }

    // 4. Update status rak menjadi aktif jika sebelumnya tidak aktif
    await connection.query("UPDATE master_racks SET status = ? WHERE alamat_rak = ?", ["aktif", alamat_rak])

    // 5. Catat ke history_logs
    await connection.query(
      "INSERT INTO history_logs (part_no, alamat_rak, customer_id, tipe, jumlah, waktu_kejadian, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [part_no, alamat_rak, customer_id, "IN", jumlah, waktuSekarang, keterangan || "Barang masuk"],
    )

    await connection.commit()

    return NextResponse.json({
      success: true,
      message: `Barang berhasil ditambahkan ke inventory! Jumlah: ${jumlah}`,
      data: {
        part_no,
        alamat_rak,
        jumlah: jumlahAkhir,
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