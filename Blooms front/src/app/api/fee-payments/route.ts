import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const where = studentId ? { studentId } : {}
    const payments = await db.feePayment.findMany({
      where,
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, grade: true, parent: { select: { id: true, name: true, email: true, phone: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Fee payments list error:', error)
    return NextResponse.json({ error: 'Failed to fetch fee payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, feeId, amount, paymentMethod, referenceNo, slipUrl, term } = body
    if (!studentId || !amount || !referenceNo) {
      return NextResponse.json({ error: 'studentId, amount, and referenceNo are required' }, { status: 400 })
    }
    const validMethods = ['M-Pesa', 'Card', 'Bank Slip']
    const method = validMethods.includes(paymentMethod) ? paymentMethod : 'M-Pesa'
    const payment = await db.feePayment.create({
      data: { studentId, studentName: studentName || null, feeId: feeId || null, amount: Number(amount), paymentMethod: method, referenceNo, slipUrl: slipUrl || null, term: term || null, status: 'Pending Verification' },
    })
    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Fee payment create error:', error)
    return NextResponse.json({ error: 'Failed to create fee payment' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, action, verifiedBy } = body
    if (!paymentId) return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })

    const payment = await db.feePayment.findUnique({ where: { id: paymentId } })
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 400 })

    if (action === 'reject') {
      await db.feePayment.update({ where: { id: paymentId }, data: { status: 'Rejected' } })
      return NextResponse.json({ message: 'Payment rejected' })
    }

    // Approve/Verify
    const updatedPayment = await db.feePayment.update({
      where: { id: paymentId },
      data: { verifiedBy: verifiedBy || 'System', verifiedAt: new Date(), status: 'Verified' },
    })

    // Update fee record
    if (payment.feeId) {
      const fee = await db.fee.findUnique({ where: { id: payment.feeId } })
      if (fee) {
        const newPaid = fee.paid + payment.amount
        const newStatus = newPaid >= fee.amount ? 'Paid' : 'Partial'
        await db.fee.update({ where: { id: payment.feeId }, data: { paid: newPaid, status: newStatus, paidDate: newStatus === 'Paid' ? new Date().toISOString() : fee.paidDate } })
      }
    }

    // Auto-generate receipt
    const student = await db.student.findUnique({ where: { id: payment.studentId } })
    const lastReceipt = await db.receipt.findFirst({ orderBy: { createdAt: 'desc' } })
    const num = lastReceipt ? parseInt(lastReceipt.receiptNo.replace('RCP/', '')) || 0 : 0
    const receiptNo = `RCP/${String(num + 1).padStart(4, '0')}`
    await db.receipt.create({
      data: {
        paymentId,
        studentId: payment.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : payment.studentName || 'Unknown',
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        referenceNo: payment.referenceNo,
        term: payment.term || '',
        receiptNo,
        verifiedBy: verifiedBy || 'System',
      },
    })

    return NextResponse.json({ payment: updatedPayment, message: 'Payment verified and receipt generated' })
  } catch (error) {
    console.error('Fee payment verify error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
