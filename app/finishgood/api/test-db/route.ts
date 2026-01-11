import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getPool();
    // Query paling simple untuk test koneksi
    const [rows] = await pool.query('SELECT 1 + 1 AS result');

    return NextResponse.json({
      success: true,
      message: 'Koneksi database berhasil!',
      data: rows
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Koneksi database gagal',
      error: error.message
    }, { status: 500 });
  }
}