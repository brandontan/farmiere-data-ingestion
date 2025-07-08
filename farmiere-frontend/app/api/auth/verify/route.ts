import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing-token', request.url))
    }
    
    // Verify the magic link token
    const { payload } = await jwtVerify(token, SECRET_KEY)
    
    if (!payload.email) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }
    
    // Create session token (valid for 24 hours)
    const sessionToken = await new SignJWT({ 
      email: payload.email,
      authenticated: true 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(SECRET_KEY)
    
    // Redirect to home with session cookie
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    })
    
    return response
    
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
  }
}