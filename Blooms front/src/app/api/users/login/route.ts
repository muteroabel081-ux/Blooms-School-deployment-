import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'email and password are required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        linkedParent: { select: { id: true, name: true, email: true, phone: true, starRating: true, starTier: true } },
        linkedTeacher: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, subject: true, status: true } },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      )
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      )
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Account not verified. Please verify your OTP first.' },
        { status: 400 }
      )
    }

    const { password: _, ...safeUser } = user

    return NextResponse.json({ user: safeUser, role: user.role })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
