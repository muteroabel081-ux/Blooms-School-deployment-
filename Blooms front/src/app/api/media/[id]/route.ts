import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    const item = await db.mediaItem.delete({ where: { id } });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Delete media item error:', error);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
