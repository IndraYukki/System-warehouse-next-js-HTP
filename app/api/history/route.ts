import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: Request) {
  const pool = getPool()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100) // Maksimal 100
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Query untuk data history - dengan JOIN untuk mendapatkan nama part dan customer
    let query = `
      SELECT
        hl.id,
        hl.part_no,
        mp.nama_part,
        hl.alamat_rak,
        c.nama_customer,
        hl.tipe,
        hl.jumlah,
        hl.waktu_kejadian,
        hl.keterangan,
        hl.total_awal,
        hl.total_akhir
      FROM history_logs hl
      LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
      LEFT JOIN customers c ON hl.customer_id = c.id
    `

    const params: string[] = []

    // Tambahkan filter jika search disediakan
    if (search) {
      query += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam)
    } else {
      // Jika tidak ada pencarian, tambahkan filter 1 minggu terakhir
      query += " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
    }

    query += " ORDER BY hl.waktu_kejadian DESC LIMIT ? OFFSET ?"
    params.push(limit, offset) // Tidak perlu .toString() karena mysql2 akan menangani konversi

    let rows: any[] = []
    try {
      const [rowsResult] = await pool.query(query, params)
      rows = Array.isArray(rowsResult) ? rowsResult : []
    } catch (queryError) {
      console.error("Error in main query:", queryError)
      // Jika query dengan filter waktu gagal, coba tanpa filter waktu
      query = `
        SELECT
          hl.id,
          hl.part_no,
          mp.nama_part,
          hl.alamat_rak,
          c.nama_customer,
          hl.tipe,
          hl.jumlah,
          hl.waktu_kejadian,
          hl.keterangan,
          hl.total_awal,
          hl.total_akhir
        FROM history_logs hl
        LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
        LEFT JOIN customers c ON hl.customer_id = c.id
      `

      const fallbackParams: string[] = []
      if (search) {
        query += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
        const searchParam = `%${search}%`
        fallbackParams.push(searchParam, searchParam)
      }

      query += " ORDER BY hl.waktu_kejadian DESC LIMIT ? OFFSET ?"
      fallbackParams.push(limit, offset)

      const [fallbackResult] = await pool.query(query, fallbackParams)
      rows = Array.isArray(fallbackResult) ? fallbackResult : []
    }

    // Query untuk total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM history_logs hl
      LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
    `

    const countParams: string[] = []
    if (search) {
      countQuery += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
      const searchParam = `%${search}%`
      countParams.push(searchParam, searchParam)
    } else {
      countQuery += " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
    }

    let totalCount = 0
    try {
      const [countResult] = await pool.query(countQuery, countParams)
      if (Array.isArray(countResult) && countResult.length > 0) {
        const firstRow = countResult[0]
        if (firstRow && typeof firstRow === 'object' && firstRow.total !== undefined) {
          totalCount = Number(firstRow.total)
        }
      }
    } catch (countError) {
      console.error("Error in count query:", countError)
      // Jika query count dengan filter waktu gagal, coba tanpa filter waktu
      countQuery = `
        SELECT COUNT(*) as total
        FROM history_logs hl
        LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
      `

      const countFallbackParams: string[] = []
      if (search) {
        countQuery += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
        const searchParam = `%${search}%`
        countFallbackParams.push(searchParam, searchParam)
      }

      const [countFallbackResult] = await pool.query(countQuery, countFallbackParams)
      if (Array.isArray(countFallbackResult) && countFallbackResult.length > 0) {
        const firstRow = countFallbackResult[0]
        if (firstRow && typeof firstRow === 'object' && firstRow.total !== undefined) {
          totalCount = Number(firstRow.total)
        }
      }
    }

    return NextResponse.json({
      data: Array.isArray(rows) ? rows : [],
      total: totalCount,
      limit: limit,
      offset: offset
    })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Gagal mengambil data history: " + (error as Error).message }, { status: 500 })
  }
}