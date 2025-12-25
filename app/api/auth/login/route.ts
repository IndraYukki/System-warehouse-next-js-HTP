import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Cek user di database
    const [rows] = await pool.query(
      "SELECT id, username, password, nama_panggilan, role, email, nomor_telepon FROM users WHERE username = ?",
      [username]
    );

    const users = Array.isArray(rows) ? rows : [];

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Cocokkan password (dalam implementasi asli, Anda sebaiknya menggunakan hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Set cookie untuk menandai bahwa pengguna sudah login
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        nama_panggilan: user.nama_panggilan,
        role: user.role,
        email: user.email,
        nomor_telepon: user.nomor_telepon
      }
    });

    // Set cookie 'isLoggedIn' ke 'true'
    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 jam
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}