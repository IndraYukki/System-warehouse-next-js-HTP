import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function POST(request: Request) {
  const pool = getPool()
  let connection

  try {
    const { part_no, jumlah: jumlahInput, keterangan } = await request.json()

    // Validasi input
    if (!part_no) {
      return NextResponse.json({ error: "Part No harus diisi!" }, { status: 400 })
    }

    // Validasi jumlah
    const jumlah = jumlahInput ? parseInt(jumlahInput) : 1
    if (isNaN(jumlah) || jumlah <= 0) {
      return NextResponse.json({ error: "Jumlah harus berupa angka positif!" }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 1. Ambil semua inventory items untuk part_no ini
    const [allInventoryRows] = await connection.query(
      "SELECT * FROM inventory WHERE part_no = ? ORDER BY id",
      [part_no]
    )

    // Ambil customer_id dari item pertama (karena semua item dengan part_no yang sama seharusnya memiliki customer_id yang sama)
    const customer_id = (allInventoryRows as any[])[0]?.customer_id || null

    // 2. Hitung total stok yang tersedia
    const totalStok = (allInventoryRows as any[]).reduce((sum, item) => sum + item.jumlah, 0)

    if (totalStok < jumlah) {
      await connection.rollback()
      return NextResponse.json({
        error: `Stok tidak mencukupi! Dibutuhkan: ${jumlah}, Tersedia: ${totalStok}`
      }, { status: 400 })
    }

    let jumlahYangHarusDikurangi = jumlah
    const itemsYgDiproses = []

    // 3. Loop melalui semua item inventory untuk mengurangi jumlah
    for (const item of (allInventoryRows as any[])) {
      if (jumlahYangHarusDikurangi <= 0) break

      const jumlahDikurangiDariItemIni = Math.min(item.jumlah, jumlahYangHarusDikurangi)
      const newJumlah = item.jumlah - jumlahDikurangiDariItemIni

      if (newJumlah <= 0) {
        // Jika jumlah menjadi 0 atau kurang, hapus item dari inventory
        await connection.query("DELETE FROM inventory WHERE id = ?", [item.id])
      } else {
        // Jika masih ada sisa, update jumlahnya
        await connection.query(
          "UPDATE inventory SET jumlah = ?, updated_at = ? WHERE id = ?",
          [newJumlah, new Date(), item.id]
        )
      }

      itemsYgDiproses.push({
        alamat_rak: item.alamat_rak,
        jumlah_dikurangi: jumlahDikurangiDariItemIni
      })

      jumlahYangHarusDikurangi -= jumlahDikurangiDariItemIni
    }

    // 3. Auto-timestamp menggunakan waktu server
    const waktuSekarang = new Date()

    // 4. Update status rak jika semua barang di rak itu habis
    for (const itemProses of itemsYgDiproses) {
      // Cek apakah masih ada barang lain di rak yang sama
      const [otherItemsInRack] = await connection.query(
        "SELECT COUNT(*) as count FROM inventory WHERE alamat_rak = ?",
        [itemProses.alamat_rak]
      )

      if ((otherItemsInRack as any[])[0].count === 0) {
        // Jika tidak ada barang lain di rak ini, set status rak ke 'tidak_aktif'
        await connection.query("UPDATE master_racks SET status = ? WHERE alamat_rak = ?", ["tidak_aktif", itemProses.alamat_rak])
      }
    }

    // 5. Catat ke history_logs (buat entri untuk setiap rak yang terlibat)
    for (const itemProses of itemsYgDiproses) {
      if (itemProses.jumlah_dikurangi > 0) { // hanya catat jika benar-benar ada pengurangan
        await connection.query(
          "INSERT INTO history_logs (part_no, alamat_rak, customer_id, tipe, jumlah, waktu_kejadian, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [part_no, itemProses.alamat_rak, customer_id, "OUT", itemProses.jumlah_dikurangi, waktuSekarang, keterangan || "Barang keluar"],
        )
      }
    }

    await connection.commit()

    // Ambil alamat_rak pertama dari item yang diproses
    const alamat_rak_pertama = itemsYgDiproses.length > 0 ? itemsYgDiproses[0].alamat_rak : ''

    return NextResponse.json({
      success: true,
      message: `Barang berhasil dikeluarkan dari inventory! Jumlah: ${jumlah}`,
      data: {
        part_no,
        alamat_rak: alamat_rak_pertama,
        jumlah_keluar: jumlah,
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