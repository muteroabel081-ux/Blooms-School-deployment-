import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalStudents,
      fees,
      pendingApplications,
      recentAnnouncements,
    ] = await Promise.all([
      db.student.count(),
      db.fee.findMany(),
      db.teacher.count({ where: { status: 'Pending' } }),
      db.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    const totalFeesCollected = fees.reduce((sum, fee) => sum + fee.paid, 0)
    const totalOutstanding = fees
      .filter((fee) => fee.status !== 'Paid')
      .reduce((sum, fee) => sum + (fee.amount - fee.paid), 0)

    return NextResponse.json({
      totalStudents,
      totalFeesCollected,
      totalOutstanding,
      pendingApplications,
      recentAnnouncements,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}