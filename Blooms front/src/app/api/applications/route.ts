import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const applications = await db.application.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Applications error:', error)
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { applicantName, email, phone, position, cvUrl, whyMe, whyBlooms } = body
    if (!applicantName || !email || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const application = await db.application.create({
      data: { applicantName, email, phone: phone || '', position, cvUrl: cvUrl || null, whyMe: whyMe || '', whyBlooms: whyBlooms || '', status: 'Under Review' }
    })
    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const updated = await db.application.update({ where: { id }, data: { status: body.status || 'Under Review' } })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
