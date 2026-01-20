import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // 🔥 HARUS SAMA PERSIS DENGAN LOGIN
    const cookieOptions = {
      httpOnly: true,
      secure: false,     // ⬅️ SAMA
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,         // ⬅️ HAPUS COOKIE
    };

    response.cookies.set("isLoggedIn", "", cookieOptions);
    response.cookies.set("userId", "", cookieOptions);
    response.cookies.set("userRole", "", cookieOptions);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
