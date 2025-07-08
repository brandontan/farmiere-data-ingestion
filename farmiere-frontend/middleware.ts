import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow auth endpoints and verify endpoint
  if (path.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // Check authentication for all routes except login
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login page for web routes
    if (!path.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Unauthorized - Please login' },
      { status: 401 }
    )
  }

  try {
    await jwtVerify(token, SECRET_KEY)
    return NextResponse.next()
  } catch (error) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ]
}