import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const tripsEvents = await db.tripEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tripsEvents)
  } catch (error) {
    console.error('Trips/Events list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trips/events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, date, location, status } = body

    if (!title || !description || !date || !location) {
      return NextResponse.json(
        { error: 'title, description, date, and location are required' },
        { status: 400 }
      )
    }

    const tripEvent = await db.tripEvent.create({
      data: {
        title,
        description,
        date,
        location,
        status: status || 'Upcoming',
        images: '[]',
      },
    })

    return NextResponse.json(tripEvent, { status: 201 })
  } catch (error) {
    console.error('Trip/Event create error:', error)
    return NextResponse.json(
      { error: 'Failed to create trip/event' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, images } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (images !== undefined) {
      updateData.images = typeof images === 'string' ? images : JSON.stringify(images)
    }

    const tripEvent = await db.tripEvent.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(tripEvent)
  } catch (error) {
    console.error('Trip/Event update error:', error)
    return NextResponse.json(
      { error: 'Failed to update trip/event' },
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
        { error: 'Trip/Event id is required' },
        { status: 400 }
      )
    }

    const tripEvent = await db.tripEvent.delete({ where: { id } })

    return NextResponse.json(tripEvent)
  } catch (error) {
    console.error('Trip/Event delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete trip/event' },
      { status: 500 }
    )
  }
}