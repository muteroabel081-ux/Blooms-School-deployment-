import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const messages = await db.message.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Messages list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender, senderRole, subject, content } = body

    if (!sender || !subject || !content) {
      return NextResponse.json(
        { error: 'sender, subject, and content are required' },
        { status: 400 }
      )
    }

    const message = await db.message.create({
      data: {
        sender,
        senderRole: senderRole || 'parent',
        subject,
        content,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Message create error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Message id is required' },
        { status: 400 }
      )
    }

    const message = await db.message.update({
      where: { id },
      data: { read: read !== undefined ? read : true },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message update error:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
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
        { error: 'Message id is required' },
        { status: 400 }
      )
    }

    const message = await db.message.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message update error:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
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
        { error: 'Message id is required' },
        { status: 400 }
      )
    }

    const message = await db.message.delete({ where: { id } })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
