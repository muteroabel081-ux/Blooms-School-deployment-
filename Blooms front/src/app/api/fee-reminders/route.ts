import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    const reminders = await db.feeReminder.findMany({
      where: parentId ? { parentId } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Fee reminders error:', error)
    return NextResponse.json({ error: 'Failed to load fee reminders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, parentId, message, sentBy } = body

    const reminder = await db.feeReminder.create({
      data: {
        studentId: studentId || null,
        parentId: parentId || null,
        message,
        sentBy,
        status: 'Sent',
      },
    })

    // Create a notification too
    await db.notification.create({
      data: {
        title: 'Fee Reminder',
        message,
        type: 'warning',
        read: false,
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Create fee reminder error:', error)
    return NextResponse.json({ error: 'Failed to create fee reminder' }, { status: 500 })
  }
}
