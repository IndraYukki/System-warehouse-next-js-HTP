import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPool } from "@/lib/db";

export async function GET() {
  try {
    // Cek cookie isLoggedIn
    const isLoggedIn = cookies().get('isLoggedIn')?.value === 'true';

    if (isLoggedIn) {
      // Ambil userId dari cookie
      const userId = cookies().get('userId')?.value;

      if (userId) {
        const pool = getPool();

        // Ambil informasi user dari database berdasarkan userId
        const [rows] = await pool.query(
          "SELECT id, username, nama_panggilan, role, email, nomor_telepon FROM users WHERE id = ?",
          [parseInt(userId)]
        );

        const users = Array.isArray(rows) ? rows : [];

        if (users.length > 0) {
          const user = users[0];

          return NextResponse.json({
            isLoggedIn: true,
            user: {
              id: user.id,
              username: user.username,
              nama_panggilan: user.nama_panggilan,
              role: user.role,
              email: user.email,
              nomor_telepon: user.nomor_telepon
            }
          });
        }
      }

      // Jika userId tidak valid atau tidak ditemukan, kembalikan status tidak login
      return NextResponse.json({
        isLoggedIn: false,
        user: null
      });
    } else {
      return NextResponse.json({
        isLoggedIn: false,
        user: null
      });
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json({
      isLoggedIn: false,
      user: null
    }, { status: 500 });
  }
}