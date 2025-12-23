import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const pool = getPool()
  let connection

  try {
    const { id } = params
    const { jumlah } = await request.json()

    // Validasi input
    if (jumlah === undefined || jumlah < 0) {
      return NextResponse.json({ error: "Jumlah harus berupa angka positif atau nol!" }, { status: 400 })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    // Ambil informasi item sebelum diupdate
    const [existingItemRows] = await connection.query(
      "SELECT * FROM inventory WHERE id = ?",
      [id]
    )

    if (!Array.isArray(existingItemRows) || existingItemRows.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Item inventory tidak ditemukan!" }, { status: 404 })
    }

    const existingItem = existingItemRows[0]

    // Jika jumlah menjadi 0, hapus entri dari inventory
    if (jumlah === 0) {
      await connection.query("DELETE FROM inventory WHERE id = ?", [id])
    } else {
      // Jika jumlah tidak 0, update jumlah
      await connection.query(
        "UPDATE inventory SET jumlah = ?, updated_at = ? WHERE id = ?",
        [jumlah, new Date(), id]
      )
    }

    await connection.commit()

    // Jika jumlah menjadi 0, periksa apakah masih ada barang lain di rak yang sama
    if (jumlah === 0) {
      const [otherItemsInRack] = await connection.query(
        "SELECT COUNT(*) as count FROM inventory WHERE alamat_rak = ?",
        [existingItem.alamat_rak]
      )

      if ((otherItemsInRack as any[])[0].count === 0) {
        // Jika tidak ada barang lain di rak ini, set status rak ke 'tidak_aktif'
        await connection.query("UPDATE master_racks SET status = ? WHERE alamat_rak = ?", ["tidak_aktif", existingItem.alamat_rak])
      }
    }

    return NextResponse.json({
      success: true,
      message: jumlah === 0
        ? `Berhasil menghapus barang dari inventory (jumlah menjadi 0) untuk part ${existingItem.part_no} di rak ${existingItem.alamat_rak}`
        : `Berhasil mengupdate jumlah inventory untuk part ${existingItem.part_no} di rak ${existingItem.alamat_rak}`,
      data: {
        id: parseInt(id),
        part_no: existingItem.part_no,
        alamat_rak: existingItem.alamat_rak,
        jumlah_baru: jumlah,
        jumlah_lama: existingItem.jumlah
      }
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Error updating inventory:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat mengupdate inventory" }, { status: 500 })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const pool = getPool()

  try {
    const { id } = params

    const [rows] = await pool.query(
      `SELECT 
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
      WHERE i.id = ?`,
      [id]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Item inventory tidak ditemukan!" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat mengambil data inventory" }, { status: 500 })
  }
}