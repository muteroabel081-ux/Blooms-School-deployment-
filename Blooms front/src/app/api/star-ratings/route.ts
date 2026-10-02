import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function getTier(stars: number): string {
  if (stars >= 13) return 'Diamond'
  if (stars >= 10) return 'Platinum'
  if (stars >= 7) return 'Gold'
  if (stars >= 4) return 'Silver'
  return 'Bronze'
}

export async function GET() {
  try {
    const parents = await db.parent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        occupation: true,
        address: true,
        starRating: true,
        starTier: true,
        participation: true,
        createdAt: true,
        _count: { select: { children: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(parents)
  } catch (error) {
    console.error('Star ratings list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch parent ratings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, starRating, participation } = body

    if (!parentId) {
      return NextResponse.json(
        { error: 'parentId is required' },
        { status: 400 }
      )
    }

    const stars = starRating != null ? Math.min(13, Math.max(0, Number(starRating))) : undefined
    const tier = stars != null ? getTier(stars) : undefined

    const data: Record<string, unknown> = {}
    if (stars != null) data.starRating = stars
    if (tier) data.starTier = tier
    if (participation !== undefined) data.participation = participation

    const parent = await db.parent.update({
      where: { id: parentId },
      data,
    })

    return NextResponse.json(parent)
  } catch (error) {
    console.error('Star rating update error:', error)
    return NextResponse.json(
      { error: 'Failed to update star rating' },
      { status: 500 }
    )
  }
}
