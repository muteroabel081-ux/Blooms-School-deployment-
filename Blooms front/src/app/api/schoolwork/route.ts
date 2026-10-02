import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const grade = searchParams.get('grade')
    const type = searchParams.get('type')
    const teacherId = searchParams.get('teacherId')
    const where: Record<string, unknown> = {}
    if (grade) where.grade = grade
    if (type) where.type = type
    if (teacherId) where.teacherId = teacherId
    const work = await db.schoolWork.findMany({ where, orderBy: { createdAt: 'desc' }, include: { teacher: { select: { firstName: true, lastName: true } } } })
    return NextResponse.json(work)
  } catch (error) {
    console.error('SchoolWork error:', error)
    return NextResponse.json({ error: 'Failed to load school work' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teacherId, title, description, subject, grade, fileUrl, type } = body
    if (!title || !fileUrl) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const work = await db.schoolWork.create({ data: { teacherId: teacherId || null, title, description: description || '', subject: subject || '', grade: grade || '', fileUrl, type: type || 'Homework' } })
    return NextResponse.json(work, { status: 201 })
  } catch (error) {
    console.error('Create schoolwork error:', error)
    return NextResponse.json({ error: 'Failed to upload school work' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await db.schoolWork.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete schoolwork error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
