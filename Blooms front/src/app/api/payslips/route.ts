import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    const where = teacherId ? { teacherId } : {}

    const payslips = await db.payslip.findMany({
      where,
      include: { teacher: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(payslips)
  } catch (error) {
    console.error('Payslips list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payslips' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, month, year, basicSalary, allowances, deductions, fileUrl } = body

    if (!teacherId || !month || !year || basicSalary == null) {
      return NextResponse.json(
        { error: 'teacherId, month, year, and basicSalary are required' },
        { status: 400 }
      )
    }

    const netPay = (basicSalary || 0) + (allowances || 0) - (deductions || 0)

    const payslip = await db.payslip.create({
      data: {
        teacherId,
        month,
        year,
        basicSalary: Number(basicSalary),
        allowances: Number(allowances || 0),
        deductions: Number(deductions || 0),
        netPay,
        fileUrl: fileUrl || null,
      },
    })

    return NextResponse.json(payslip, { status: 201 })
  } catch (error) {
    console.error('Payslip create error:', error)
    return NextResponse.json(
      { error: 'Failed to create payslip' },
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
        { error: 'Payslip id is required' },
        { status: 400 }
      )
    }

    const payslip = await db.payslip.delete({ where: { id } })

    return NextResponse.json(payslip)
  } catch (error) {
    console.error('Payslip delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payslip' },
      { status: 500 }
    )
  }
}
