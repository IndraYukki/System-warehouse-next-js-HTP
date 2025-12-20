import { getPool } from './db';

/**
 * Fungsi untuk menguji koneksi ke database
 */
export async function testConnection() {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    console.log('✅ Koneksi ke database berhasil!');
    
    // Mendapatkan informasi database
    const [rows] = await pool.query('SELECT @@version as version');
    console.log(' versi MySQL:', (rows as Array<any>)[0]?.version);
    
    return true;
  } catch (error) {
    console.error('❌ Koneksi ke database gagal:', error);
    return false;
  }
}