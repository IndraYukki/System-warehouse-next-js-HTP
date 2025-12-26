import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Jika path adalah login dan user sudah login, redirect ke dashboard
  if (request.nextUrl.pathname === '/login') {
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
    if (isLoggedIn) {
      // Redirect ke dashboard utama jika sudah login
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Cek apakah pengguna sudah login
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  // Halaman yang bisa diakses tanpa login (public pages)
  const publicPaths = [
    '/',
    '/inventory',
    '/inbound',
    '/outbound',
    '/history'
  ];

  // Jika bukan halaman publik dan belum login, redirect ke login
  if (!isLoggedIn &&
      !publicPaths.some(path => request.nextUrl.pathname.startsWith(path)) &&
      request.nextUrl.pathname !== '/login' &&
      !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login, periksa akses berdasarkan role
  if (isLoggedIn) {
    // Ambil role dari cookie
    const userRole = request.cookies.get('userRole')?.value;

    // Periksa akses berdasarkan role
    if (request.nextUrl.pathname.startsWith('/admin/edit-inventory') ||
        request.nextUrl.pathname.startsWith('/edit-inventory')) {
      // Hanya admin yang bisa mengakses edit-inventory
      if (userRole === 'manager' || userRole === 'user') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    // Akses khusus untuk user di halaman admin
    if (userRole === 'user') {
      // User tidak bisa mengakses beberapa halaman admin
      if (
        request.nextUrl.pathname.startsWith('/admin/edit-product') ||
        request.nextUrl.pathname.startsWith('/admin/statistics') ||
        (request.nextUrl.pathname.startsWith('/admin') &&
         !request.nextUrl.pathname.startsWith('/admin/dashboard') &&
         !request.nextUrl.pathname.startsWith('/admin/rack-status'))
      ) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

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