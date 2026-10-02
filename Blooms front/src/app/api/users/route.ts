import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        linkedParent: { select: { id: true, name: true, email: true, phone: true } },
        linkedTeacher: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const safeUsers = users.map((u) => {
      const { password, ...rest } = u
      return rest
    })

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Users list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'email and role are required' },
        { status: 400 }
      )
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    const user = await db.user.create({
      data: {
        email,
        role,
        password: 'Blooms@2025',
        otp,
        otpExpiry,
      },
    })

    const { password: _, ...safeUser } = user
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')

    return NextResponse.json(
      { user: safeUser, message: `OTP sent to ${maskedEmail}` },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('User register error:', error)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
