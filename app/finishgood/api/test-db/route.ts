import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db'; 
import { testConnection } from '@/lib/db-test';

export async function GET(request: Request) {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Koneksi database berhasil' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Koneksi database gagal' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saat menguji koneksi database:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menguji koneksi database',
      error: (error as Error).message
    }, { status: 500 });
  }
}