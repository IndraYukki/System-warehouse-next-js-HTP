import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// PUT: Mengupdate data master rack
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pool = getPool()
  
  try {
    const id = params.id
    const { alamat_rak, zona, kapasitas, status } = await request.json()

    // Validasi input
    if (!id || !alamat_rak || !zona) {
      return NextResponse.json({ error: "ID, Alamat Rak, dan Zona harus diisi!" }, { status: 400 })
    }

    // Cek apakah alamat_rak sudah ada (kecuali untuk record yang sedang diupdate)
    const [existingRows] = await pool.query(
      "SELECT * FROM master_racks WHERE alamat_rak = ? AND id != ?",
      [alamat_rak, id]
    )
    if ((existingRows as any[]).length > 0) {
      return NextResponse.json({ error: "Alamat Rak sudah terdaftar!" }, { status: 400 })
    }

    // Update data
    await pool.query(
      "UPDATE master_racks SET alamat_rak = ?, zona = ?, kapasitas = ?, status = ? WHERE id = ?",
      [alamat_rak, zona, kapasitas || 0, status || 'aktif', id]
    )

    return NextResponse.json({
      success: true,
      message: "Data rak berhasil diperbarui!",
    })
  } catch (error) {
    console.error("Error updating rack:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}

// DELETE: Menghapus data master rack
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
    await pool.query("DELETE FROM master_racks WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: "Data rak berhasil dihapus!",
    })
  } catch (error) {
    console.error("Error deleting rack:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}