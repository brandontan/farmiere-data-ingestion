import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { Resend } from 'resend'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

const ALLOWED_EMAILS = ['ai.ops@fefifo.co', 'brandon@n8npro.com', 'brandontan@gmail.com', 'gavintan.hs@gmail.com']

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Check if email is allowed
    if (!ALLOWED_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Access denied. This email is not authorized.' },
        { status: 403 }
      )
    }
    
    // Create magic link token (valid for 10 minutes)
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10m')
      .sign(SECRET_KEY)
    
    // Create magic link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://farmiere-frontend.vercel.app'
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`
    
    // Send email with Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'Farmiere CSV Upload <onboarding@resend.dev>',
        to: [email],
        subject: 'Login to Farmiere CSV Upload System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Login to Farmiere CSV Upload System</h2>
            <p>Click the link below to access the CSV upload system:</p>
            <a href="${magicLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Login to System
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this login, please ignore this email.</p>
          </div>
        `
      })

      if (error) {
        console.error('Resend error:', error)
        // Fallback to console log
        console.log(`Magic link for ${email}: ${magicLink}`)
        
        // For ai.ops@fefifo.co, always show the link since email won't send
        if (email === 'ai.ops@fefifo.co') {
          return NextResponse.json({ 
            success: true,
            message: 'Magic link generated! Copy this link:',
            magicLink
          })
        }
        
        return NextResponse.json({ 
          success: true,
          message: 'Magic link generated! Check console logs (email sending failed).',
          magicLink
        })
      }

      console.log('Email sent successfully:', data)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Fallback to console log
      console.log(`Magic link for ${email}: ${magicLink}`)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Magic link sent! Check your email.',
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}