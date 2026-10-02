import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category ? { category } : {}

    const mediaItems = await db.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(mediaItems)
  } catch (error) {
    console.error('Media list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, category, imageUrl } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'title and imageUrl are required' },
        { status: 400 }
      )
    }

    const mediaItem = await db.mediaItem.create({
      data: {
        title,
        category: category || 'General',
        imageUrl,
      },
    })

    return NextResponse.json(mediaItem, { status: 201 })
  } catch (error) {
    console.error('Media create error:', error)
    return NextResponse.json(
      { error: 'Failed to create media item' },
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
        { error: 'Media id is required' },
        { status: 400 }
      )
    }

    const mediaItem = await db.mediaItem.delete({ where: { id } })

    return NextResponse.json(mediaItem)
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete media item' },
      { status: 500 }
    )
  }
}