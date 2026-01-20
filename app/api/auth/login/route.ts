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

    // Ambil user dari database
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

    const user: any = users[0];

    // Cocokkan password (belum hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        nama_panggilan: user.nama_panggilan,
        role: user.role,
        email: user.email,
        nomor_telepon: user.nomor_telepon,
      },
    });

    // 🔥 OPTIONS COOKIE (MODE LAN / KANTOR)
    const cookieOptions = {
      httpOnly: true,
      secure: false,     // ⬅️ PENTING
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    };

    response.cookies.set("isLoggedIn", "true", cookieOptions);
    response.cookies.set("userId", user.id.toString(), cookieOptions);
    response.cookies.set("userRole", user.role, cookieOptions);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
