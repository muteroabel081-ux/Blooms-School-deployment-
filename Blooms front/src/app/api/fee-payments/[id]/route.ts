import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await db.feePayment.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, admissionNo: true, grade: true, parent: { select: { id: true, name: true, email: true, phone: true } } },
        },
      },
    })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Fee payment get error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, verifiedBy } = body

    const payment = await db.feePayment.findUnique({ where: { id } })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (status === 'Rejected') {
      const updated = await db.feePayment.update({
        where: { id },
        data: { status: 'Rejected' },
      })
      return NextResponse.json(updated)
    }

    if (status === 'Verified') {
      const updatedPayment = await db.feePayment.update({
        where: { id },
        data: {
          status: 'Verified',
          verifiedBy: verifiedBy || 'Admin',
          verifiedAt: new Date(),
        },
      })

      // Update fee record paid amount
      if (payment.feeId) {
        const fee = await db.fee.findUnique({ where: { id: payment.feeId } })
        if (fee) {
          const newPaid = fee.paid + payment.amount
          const newStatus = newPaid >= fee.amount ? 'Paid' : 'Partial'
          await db.fee.update({
            where: { id: payment.feeId },
            data: {
              paid: newPaid,
              status: newStatus,
              paidDate: newStatus === 'Paid' ? new Date().toISOString() : fee.paidDate,
            },
          })
        }
      }

      return NextResponse.json(updatedPayment)
    }

    return NextResponse.json({ error: 'Invalid status. Use "Verified" or "Rejected".' }, { status: 400 })
  } catch (error) {
    console.error('Fee payment patch error:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}
