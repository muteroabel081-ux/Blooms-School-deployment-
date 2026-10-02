import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const where: Record<string, unknown> = {}
    if (studentId) where.studentId = studentId
    const receipts = await db.receipt.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Receipts error:', error)
    return NextResponse.json({ error: 'Failed to load receipts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId, studentId, studentName, amount, paymentMethod, referenceNo, term, verifiedBy } = body
    if (!paymentId || !studentId || !amount) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const lastReceipt = await db.receipt.findFirst({ orderBy: { createdAt: 'desc' } })
    const num = lastReceipt ? parseInt(lastReceipt.receiptNo.replace('RCP/', '')) || 0 : 0
    const receiptNo = `RCP/${String(num + 1).padStart(4, '0')}`
    const receipt = await db.receipt.create({ data: { paymentId, studentId, studentName: studentName || '', amount, paymentMethod: paymentMethod || 'M-Pesa', referenceNo, term: term || '', receiptNo, verifiedBy: verifiedBy || null } })
    return NextResponse.json(receipt, { status: 201 })
  } catch (error) {
    console.error('Create receipt error:', error)
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
  }
}
