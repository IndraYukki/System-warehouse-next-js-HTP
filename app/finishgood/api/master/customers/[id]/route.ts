import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

// PUT: Mengupdate data customer
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pool = getPool()
  
  try {
    const id = params.id
    const { nama_customer, alamat, telepon, email } = await request.json()

    // Validasi input
    if (!id || !nama_customer) {
      return NextResponse.json({ error: "ID dan Nama Customer harus diisi!" }, { status: 400 })
    }

    // Update data
    await pool.query(
      "UPDATE customers SET nama_customer = ?, alamat = ?, telepon = ?, email = ? WHERE id = ?",
      [nama_customer, alamat, telepon, email, id]
    )

    return NextResponse.json({
      success: true,
      message: "Data customer berhasil diperbarui!",
    })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}

// DELETE: Menghapus data customer
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
    await pool.query("DELETE FROM customers WHERE id = ?", [id])

    return NextResponse.json({
      success: true,
      message: "Data customer berhasil dihapus!",
    })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 })
  }
}