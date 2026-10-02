import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    const where = teacherId ? { teacherId } : {}

    const conducts = await db.teacherConduct.findMany({
      where,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(conducts)
  } catch (error) {
    console.error('Conducts list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conduct records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, rating, comments, loggedBy, period } = body

    if (!teacherId || !rating || !comments || !loggedBy || !period) {
      return NextResponse.json(
        { error: 'teacherId, rating, comments, loggedBy, and period are required' },
        { status: 400 }
      )
    }

    const conduct = await db.teacherConduct.create({
      data: { teacherId, rating, comments, loggedBy, period },
    })

    return NextResponse.json(conduct, { status: 201 })
  } catch (error) {
    console.error('Conduct create error:', error)
    return NextResponse.json(
      { error: 'Failed to create conduct record' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, rating, comments, period } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Conduct id is required' },
        { status: 400 }
      )
    }

    const data: Record<string, string> = {}
    if (rating) data.rating = rating
    if (comments) data.comments = comments
    if (period) data.period = period

    const conduct = await db.teacherConduct.update({
      where: { id },
      data,
    })

    return NextResponse.json(conduct)
  } catch (error) {
    console.error('Conduct update error:', error)
    return NextResponse.json(
      { error: 'Failed to update conduct record' },
      { status: 500 }
    )
  }
}
