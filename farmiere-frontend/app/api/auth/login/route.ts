import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

const ALLOWED_EMAILS = ['ai.ops@fefifo.co', 'brandon@n8npro.com', 'brandontan@gmail.com', 'gavintan.hs@gmail.com']
const MASTER_PASSWORD = 'fefifofarmiern8n'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Check if email is allowed
    if (!ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check password
    if (password !== MASTER_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Create JWT token (valid for 24 hours)
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(SECRET_KEY)
    
    // Set auth cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    })
    
    return response
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}