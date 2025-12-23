import { NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  // Dapatkan cookie dari headers
  const cookieStore = cookies()
  const isLoggedIn = cookieStore.get('isLoggedIn')?.value === 'true'

  if (isLoggedIn) {
    return NextResponse.json({ authenticated: true })
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}