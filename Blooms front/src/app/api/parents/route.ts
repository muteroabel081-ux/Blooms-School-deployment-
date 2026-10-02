import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}

    const parents = await db.parent.findMany({
      where,
      include: {
        _count: {
          select: { children: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(parents)
  } catch (error) {
    console.error('Parents list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, occupation, address } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'name, email, and phone are required' },
        { status: 400 }
      )
    }

    const parent = await db.parent.create({
      data: {
        name,
        email,
        phone,
        occupation,
        address,
      },
    })

    return NextResponse.json(parent, { status: 201 })
  } catch (error: unknown) {
    console.error('Parent create error:', error)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create parent' },
      { status: 500 }
    )
  }
}