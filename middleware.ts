import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Jika path adalah login dan user sudah login, redirect ke dashboard admin
  if (request.nextUrl.pathname === '/login') {
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
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