import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const teachers = await db.teacher.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Teachers list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, qualification, status, profileImage } = body

    if (!firstName || !lastName || !email || !phone || !subject) {
      return NextResponse.json(
        { error: 'firstName, lastName, email, phone, and subject are required' },
        { status: 400 }
      )
    }

    const teacher = await db.teacher.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        subject,
        qualification,
        status: status || 'Active',
        profileImage: profileImage || null,
      },
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error: unknown) {
    console.error('Teacher create error:', error)
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
      { error: 'Failed to create teacher' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      )
    }

    const teacher = await db.teacher.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Teacher update error:', error)
    return NextResponse.json(
      { error: 'Failed to update teacher' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Teacher id is required' },
        { status: 400 }
      )
    }

    const teacher = await db.teacher.delete({ where: { id } })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Teacher delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    )
  }
}