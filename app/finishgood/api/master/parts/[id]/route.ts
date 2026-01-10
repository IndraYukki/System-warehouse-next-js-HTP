import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// PUT: Mengupdate data master part
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pool = getPool()

  try {
    const id = params.id
    const { part_no, nama_part, deskripsi, satuan, customer_id } = await request.json()

    // Validasi input
    if (!id || !part_no || !nama_part || !satuan) {
      return NextResponse.json({ error: "ID, Part No, Nama Part, dan Satuan harus diisi!" }, { status: 400 })
    }

    // Cek apakah part_no sudah ada (kecuali untuk record yang sedang diupdate)
    const [existingRows] = await pool.query(
      "SELECT * FROM master_parts WHERE part_no = ? AND id != ?",
      [part_no, id]
    )
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Part No sudah terdaftar!" }, { status: 400 })
    }

    // Update data
    await pool.query(
      "UPDATE master_parts SET part_no = ?, nama_part = ?, deskripsi = ?, satuan = ?, customer_id = ? WHERE id = ?",
      [part_no, nama_part, deskripsi, satuan, customer_id || null, id]
    )

    return NextResponse.json({
      success: true,
      message: "Data part berhasil diperbarui!",
    })
  } catch (error) {
    console.error("Error updating part:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}

// DELETE: Menghapus data master part
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pool = getPool()

  try {
    const id = params.id

    // Validasi input
    if (!id) {
      return NextResponse.json({ error: "ID harus diisi!" }, { status: 400 })
    }

    // Hapus data
    await pool.query("DELETE FROM master_parts WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: "Data part berhasil dihapus!",
    })
  } catch (error) {
    console.error("Error deleting part:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}