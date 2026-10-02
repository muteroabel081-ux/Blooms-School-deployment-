import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    const where = teacherId ? { teacherId } : {}

    const schemes = await db.schemeOfWork.findMany({
      where,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(schemes)
  } catch (error) {
    console.error('Schemes list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schemes of work' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, title, subject, grade, term, fileUrl } = body

    if (!teacherId || !title || !subject || !grade || !term || !fileUrl) {
      return NextResponse.json(
        { error: 'teacherId, title, subject, grade, term, and fileUrl are required' },
        { status: 400 }
      )
    }

    const scheme = await db.schemeOfWork.create({
      data: { teacherId, title, subject, grade, term, fileUrl },
    })

    return NextResponse.json(scheme, { status: 201 })
  } catch (error) {
    console.error('Scheme create error:', error)
    return NextResponse.json(
      { error: 'Failed to create scheme of work' },
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
        { error: 'Scheme id is required' },
        { status: 400 }
      )
    }

    const scheme = await db.schemeOfWork.delete({ where: { id } })

    return NextResponse.json(scheme)
  } catch (error) {
    console.error('Scheme delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete scheme' },
      { status: 500 }
    )
  }
}
