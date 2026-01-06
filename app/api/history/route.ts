import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET(request: Request) {
  const pool = getPool()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100) // Maksimal 100
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Validasi format tanggal
    let validatedStartDate = null
    let validatedEndDate = null

    if (startDate) {
      const date = new Date(startDate)
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Format tanggal mulai tidak valid. Gunakan format YYYY-MM-DD." }, { status: 400 })
      }
      validatedStartDate = date.toISOString().split('T')[0]
    }

    if (endDate) {
      const date = new Date(endDate)
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: "Format tanggal akhir tidak valid. Gunakan format YYYY-MM-DD." }, { status: 400 })
      }
      validatedEndDate = date.toISOString().split('T')[0]
    }

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
    let whereClauseAdded = false

    // Tambahkan filter jika search disediakan
    if (search) {
      query += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam)
      whereClauseAdded = true
    }

    // Tambahkan filter tanggal jika disediakan
    if (validatedStartDate && validatedEndDate) {
      query += whereClauseAdded ? " AND hl.waktu_kejadian BETWEEN ? AND ?" : " WHERE hl.waktu_kejadian BETWEEN ? AND ?"
      params.push(`${validatedStartDate} 00:00:00`, `${validatedEndDate} 23:59:59`)
      whereClauseAdded = true
    } else if (validatedStartDate) {
      query += whereClauseAdded ? " AND hl.waktu_kejadian >= ?" : " WHERE hl.waktu_kejadian >= ?"
      params.push(`${validatedStartDate} 00:00:00`)
      whereClauseAdded = true
    } else if (validatedEndDate) {
      query += whereClauseAdded ? " AND hl.waktu_kejadian <= ?" : " WHERE hl.waktu_kejadian <= ?"
      params.push(`${validatedEndDate} 23:59:59`)
      whereClauseAdded = true
    } else {
      // Jika tidak ada filter tanggal, gunakan default 1 minggu terakhir
      query += whereClauseAdded ? " AND hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)" : " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
    }

    query += " ORDER BY hl.waktu_kejadian DESC LIMIT ? OFFSET ?"
    params.push(limit, offset) // Tidak perlu .toString() karena mysql2 akan menangani konversi

    let rows: any[] = []
    try {
      const [rowsResult] = await pool.query(query, params)
      rows = Array.isArray(rowsResult) ? rowsResult : []
    } catch (queryError) {
      console.error("Error in main query:", queryError)
      // Jika query dengan filter tanggal gagal, coba tanpa filter tanggal
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
      let fallbackWhereClauseAdded = false

      if (search) {
        query += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
        const searchParam = `%${search}%`
        fallbackParams.push(searchParam, searchParam)
        fallbackWhereClauseAdded = true
      }

      // Tambahkan filter tanggal ke fallback query jika disediakan
      if (validatedStartDate && validatedEndDate) {
        query += fallbackWhereClauseAdded ? " AND hl.waktu_kejadian BETWEEN ? AND ?" : " WHERE hl.waktu_kejadian BETWEEN ? AND ?"
        fallbackParams.push(`${validatedStartDate} 00:00:00`, `${validatedEndDate} 23:59:59`)
        fallbackWhereClauseAdded = true
      } else if (validatedStartDate) {
        query += fallbackWhereClauseAdded ? " AND hl.waktu_kejadian >= ?" : " WHERE hl.waktu_kejadian >= ?"
        fallbackParams.push(`${validatedStartDate} 00:00:00`)
        fallbackWhereClauseAdded = true
      } else if (validatedEndDate) {
        query += fallbackWhereClauseAdded ? " AND hl.waktu_kejadian <= ?" : " WHERE hl.waktu_kejadian <= ?"
        fallbackParams.push(`${validatedEndDate} 23:59:59`)
        fallbackWhereClauseAdded = true
      } else {
        // Jika tidak ada filter tanggal, gunakan default 1 minggu terakhir
        query += fallbackWhereClauseAdded ? " AND hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)" : " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
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
    let countWhereClauseAdded = false

    if (search) {
      countQuery += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
      const searchParam = `%${search}%`
      countParams.push(searchParam, searchParam)
      countWhereClauseAdded = true
    }

    // Tambahkan filter tanggal ke count query
    if (validatedStartDate && validatedEndDate) {
      countQuery += countWhereClauseAdded ? " AND hl.waktu_kejadian BETWEEN ? AND ?" : " WHERE hl.waktu_kejadian BETWEEN ? AND ?"
      countParams.push(`${validatedStartDate} 00:00:00`, `${validatedEndDate} 23:59:59`)
      countWhereClauseAdded = true
    } else if (validatedStartDate) {
      countQuery += countWhereClauseAdded ? " AND hl.waktu_kejadian >= ?" : " WHERE hl.waktu_kejadian >= ?"
      countParams.push(`${validatedStartDate} 00:00:00`)
      countWhereClauseAdded = true
    } else if (validatedEndDate) {
      countQuery += countWhereClauseAdded ? " AND hl.waktu_kejadian <= ?" : " WHERE hl.waktu_kejadian <= ?"
      countParams.push(`${validatedEndDate} 23:59:59`)
      countWhereClauseAdded = true
    } else {
      // Jika tidak ada filter tanggal, gunakan default 1 minggu terakhir
      countQuery += countWhereClauseAdded ? " AND hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)" : " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
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
      // Jika query count dengan filter tanggal gagal, coba tanpa filter tanggal
      countQuery = `
        SELECT COUNT(*) as total
        FROM history_logs hl
        LEFT JOIN master_parts mp ON hl.part_no = mp.part_no
      `

      const countFallbackParams: string[] = []
      let countFallbackWhereClauseAdded = false

      if (search) {
        countQuery += " WHERE hl.part_no LIKE ? OR mp.nama_part LIKE ?"
        const searchParam = `%${search}%`
        countFallbackParams.push(searchParam, searchParam)
        countFallbackWhereClauseAdded = true
      }

      // Tambahkan filter tanggal ke fallback count query jika disediakan
      if (validatedStartDate && validatedEndDate) {
        countQuery += countFallbackWhereClauseAdded ? " AND hl.waktu_kejadian BETWEEN ? AND ?" : " WHERE hl.waktu_kejadian BETWEEN ? AND ?"
        countFallbackParams.push(`${validatedStartDate} 00:00:00`, `${validatedEndDate} 23:59:59`)
        countFallbackWhereClauseAdded = true
      } else if (validatedStartDate) {
        countQuery += countFallbackWhereClauseAdded ? " AND hl.waktu_kejadian >= ?" : " WHERE hl.waktu_kejadian >= ?"
        countFallbackParams.push(`${validatedStartDate} 00:00:00`)
        countFallbackWhereClauseAdded = true
      } else if (validatedEndDate) {
        countQuery += countFallbackWhereClauseAdded ? " AND hl.waktu_kejadian <= ?" : " WHERE hl.waktu_kejadian <= ?"
        countFallbackParams.push(`${validatedEndDate} 23:59:59`)
        countFallbackWhereClauseAdded = true
      } else {
        // Jika tidak ada filter tanggal, gunakan default 1 minggu terakhir
        countQuery += countFallbackWhereClauseAdded ? " AND hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)" : " WHERE hl.waktu_kejadian >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
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
      offset: offset,
      filters: {
        search,
        start_date: startDate,
        end_date: endDate
      }
    })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Gagal mengambil data history: " + (error as Error).message }, { status: 500 })
  }
}