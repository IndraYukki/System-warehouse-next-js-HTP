import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Hapus cookie login
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil"
    });

    // Hapus cookie 'isLoggedIn', 'userId', dan 'userRole'
    response.cookies.set('isLoggedIn', 'false', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire cookie
      path: '/',
      sameSite: 'strict',
    });

    response.cookies.set('userId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire cookie
      path: '/',
      sameSite: 'strict',
    });

    response.cookies.set('userRole', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire cookie
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}