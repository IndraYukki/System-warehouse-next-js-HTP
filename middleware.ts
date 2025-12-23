import { NextRequest, NextResponse } from "next/server"

// Daftar path yang memerlukan login
const protectedPaths = [
  '/edit-inventory'
]

export function middleware(request: NextRequest) {
  // Jika path dilindungi
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    // Dapatkan token dari cookie atau header
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
    
    // Jika tidak login, redirect ke halaman login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Jika path adalah login dan user sudah login, redirect ke edit-inventory
  if (request.nextUrl.pathname === '/login') {
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/edit-inventory', request.url))
    }
  }

  return NextResponse.next()
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
}