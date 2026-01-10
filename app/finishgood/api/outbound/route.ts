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
    const jumlah = Number(jumlahInput ? parseInt(jumlahInput) : 1)
    if (isNaN(jumlah) || jumlah <= 0) {
      return NextResponse.json({ error: "Jumlah harus berupa angka positif!" }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // 1. Ambil semua inventory items untuk part_no ini, diurutkan berdasarkan tanggal masuk terlama (FIFO)
    const [allInventoryRows] = await connection.query(
      "SELECT * FROM inventory WHERE part_no = ? ORDER BY tgl_masuk ASC, id ASC",
      [part_no]
    )

    // Ambil customer_id dari item pertama (karena semua item dengan part_no yang sama seharusnya memiliki customer_id yang sama)
    const customer_id = (allInventoryRows as any[])[0]?.customer_id || null

    // 2. Hitung total stok yang tersedia
    const totalStok = (allInventoryRows as any[]).reduce((sum, item) => sum + item.jumlah, 0)

    if (totalStok < jumlah) {
      await connection.rollback()
      // Mencari rak mana saja yang memiliki stok untuk part ini
      const rakDenganStok = (allInventoryRows as any[]).filter(item => item.jumlah > 0)
      const rakInfo = rakDenganStok.map(item => `Rak ${item.alamat_rak}: ${item.jumlah} pcs`).join(', ')

      let errorMessage = `Stok tidak mencukupi! Dibutuhkan: ${jumlah}, Tersedia: ${totalStok}`
      if (rakInfo) {
        errorMessage += `. Stok tersedia di: ${rakInfo}`
      }

      return NextResponse.json({
        error: errorMessage
      }, { status: 400 })
    }

    // 3. Hitung total_awal SEBELUM mengurangi jumlah di inventory
    const [totalAwalRows] = await connection.query(
      "SELECT COALESCE(SUM(jumlah), 0) AS total FROM inventory WHERE part_no = ?",
      [part_no]
    );
    const total_awal = Number((totalAwalRows as any[])[0].total);

    // 4. Periksa apakah jumlah yang diminta bisa dipenuhi dari rak-rak yang tersedia (menggunakan FIFO)
    let jumlahYangHarusDikurangi = jumlah
    const itemsYgDiproses = []
    const allInventoryArray = (allInventoryRows as any[])

    // Loop melalui semua item inventory untuk mengurangi jumlah (menggunakan FIFO)
    for (const item of allInventoryArray) {
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

    // Jika masih ada jumlah yang harus dikurangi setelah semua rak diperiksa
    if (jumlahYangHarusDikurangi > 0) {
      await connection.rollback()
      // Dapatkan informasi rak yang terkait dengan part ini
      const rakInfo = allInventoryArray.map(item => item.alamat_rak).join(', ')
      return NextResponse.json({
        error: `QTY yang diminta tidak tersedia di rak (${rakInfo})`
      }, { status: 400 })
    }

    // 5. Auto-timestamp menggunakan waktu server
    const waktuSekarang = new Date()

    // 6. Update status rak jika semua barang di rak itu habis
    for (const itemProses of itemsYgDiproses) {
      // Cek apakah masih ada barang lain di rak yang sama
      const [otherItemsInRack] = await connection.query(
        "SELECT COUNT(*) as count FROM inventory WHERE alamat_rak = ?",
        [itemProses.alamat_rak]
      )

      if ((otherItemsInRack as any[])[0].count === 0) {
        // Jika tidak ada barang lain di rak ini, set status rak ke 'available'
        await connection.query("UPDATE master_racks SET status = ? WHERE alamat_rak = ?", ["available", itemProses.alamat_rak])
      }
    }

    // 7. Hitung total_akhir setelah pengurangan
    const total_akhir = total_awal - jumlah; // jumlah adalah total yang dikeluarkan

    // 8. Catat ke history_logs (buat entri untuk setiap rak yang terlibat)
    for (const itemProses of itemsYgDiproses) {
      if (itemProses.jumlah_dikurangi > 0) { // hanya catat jika benar-benar ada pengurangan
        await connection.query(
          "INSERT INTO history_logs (part_no, alamat_rak, customer_id, tipe, jumlah, waktu_kejadian, keterangan, total_awal, total_akhir) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [part_no, itemProses.alamat_rak, customer_id, "OUT", itemProses.jumlah_dikurangi, waktuSekarang, keterangan || "Barang keluar", total_awal, total_akhir],
        )
      }
    }

    await connection.commit()

    // Ambil alamat_rak pertama dari item yang diproses
    const alamat_rak_pertama = itemsYgDiproses.length > 0 ? itemsYgDiproses[0].alamat_rak : ''

    // Buat informasi detail tentang rak mana saja yang digunakan
    const rakInfo = itemsYgDiproses.map(item => `Rak ${item.alamat_rak}: ${item.jumlah_dikurangi} pcs`).join(', ')
    const message = `Barang berhasil dikeluarkan dari inventory! Jumlah: ${jumlah}. Detail: ${rakInfo}`

    return NextResponse.json({
      success: true,
      message: message,
      data: {
        part_no,
        alamat_rak: alamat_rak_pertama,
        jumlah_keluar: jumlah,
        tgl_keluar: waktuSekarang,
        rak_detail: itemsYgDiproses // Tambahkan informasi detail rak ke response
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