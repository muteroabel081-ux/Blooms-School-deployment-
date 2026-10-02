import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const fees = await db.fee.findMany({
      where,
      include: { student: { include: { parent: { select: { id: true, name: true, email: true, phone: true } } } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(fees)
  } catch (error) {
    console.error('Fees list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, term, amount, dueDate } = body

    if (!studentId || !term || !amount) {
      return NextResponse.json(
        { error: 'studentId, term, and amount are required' },
        { status: 400 }
      )
    }

    const fee = await db.fee.create({
      data: {
        studentId,
        term,
        amount: parseFloat(amount),
        paid: 0,
        status: 'Pending',
        dueDate,
      },
    })

    return NextResponse.json(fee, { status: 201 })
  } catch (error) {
    console.error('Fee create error:', error)
    return NextResponse.json(
      { error: 'Failed to create fee record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, paid, paidDate, status } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Fee id is required' },
        { status: 400 }
      )
    }

    const fee = await db.fee.update({
      where: { id },
      data: {
        ...(paid !== undefined && { paid: parseFloat(paid) }),
        ...(paidDate && { paidDate }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(fee)
  } catch (error) {
    console.error('Fee update error:', error)
    return NextResponse.json(
      { error: 'Failed to update fee' },
      { status: 500 }
    )
  }
}