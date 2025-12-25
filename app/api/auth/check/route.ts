import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Periksa apakah ada cookie 'isLoggedIn' yang menunjukkan status login
  const cookieStore = cookies();
  const isLoggedIn = cookieStore.get('isLoggedIn');

  if (isLoggedIn && isLoggedIn.value === 'true') {
    // Jika cookie menunjukkan bahwa pengguna sudah login
    return NextResponse.json({
      authenticated: true,
      message: "Pengguna sudah otentikasi"
    });
  } else {
    // Jika tidak ada cookie atau cookie tidak menunjukkan status login
    return NextResponse.json({
      authenticated: false,
      message: "Silakan login untuk mengakses halaman ini"
    });
  }
}