import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // --- BYPASS ACCESS CONTROL ---
  // Semua akses diizinkan. Middleware ini sekarang hanya membaca cookie,
  // tetapi tidak melakukan pengecekan role atau path restriction.
  // Cookie 'isLoggedIn' dan 'userRole' tetap dibaca untuk keperluan lain (jika ada),
  // tetapi tidak digunakan untuk kontrol akses dalam middleware ini.

  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  // const userRole = request.cookies.get('userRole')?.value; // Tidak digunakan untuk kontrol akses

  // Jika path adalah login dan user sudah login, redirect ke dashboard
  // (Logika ini bisa tetap ada jika berguna untuk UX, meskipun akses tidak dibatasi)
  if (request.nextUrl.pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Izinkan semua permintaan untuk melanjutkan
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};