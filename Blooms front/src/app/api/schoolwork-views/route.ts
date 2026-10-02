import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schoolWorkId, studentId, action } = body
    if (!schoolWorkId || !studentId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const view = await db.schoolWorkView.create({ data: { schoolWorkId, studentId, action: action || 'viewed' } })
    return NextResponse.json(view, { status: 201 })
  } catch (error) {
    console.error('Track view error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolWorkId = searchParams.get('schoolWorkId')
    const where: Record<string, unknown> = {}
    if (schoolWorkId) where.schoolWorkId = schoolWorkId
    const views = await db.schoolWorkView.findMany({ where, include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(views)
  } catch (error) {
    console.error('Views error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
