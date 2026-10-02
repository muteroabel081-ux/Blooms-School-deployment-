import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Notifications list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      )
    }

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type: type || 'info',
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Notification create error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Notification id is required' },
        { status: 400 }
      )
    }

    const notification = await db.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const result = await db.notification.deleteMany({
      where: { read: true },
    })

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Notification delete error:', error)
    return NextResponse.json(
      { error: 'Failed to clear notifications' },
      { status: 500 }
    )
  }
}