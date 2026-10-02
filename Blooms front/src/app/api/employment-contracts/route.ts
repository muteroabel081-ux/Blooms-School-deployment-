import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    const where = teacherId ? { teacherId } : {}

    const contracts = await db.employmentContract.findMany({
      where,
      include: { teacher: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Contracts list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, contractNo, startDate, endDate, salary, position, fileUrl } = body

    if (!teacherId || !contractNo || !startDate || !salary || !position) {
      return NextResponse.json(
        { error: 'teacherId, contractNo, startDate, salary, and position are required' },
        { status: 400 }
      )
    }

    const contract = await db.employmentContract.create({
      data: {
        teacherId,
        contractNo,
        startDate,
        endDate: endDate || null,
        salary: Number(salary),
        position,
        fileUrl: fileUrl || null,
        status: 'Active',
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Contract create error:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
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
        { error: 'Contract id is required' },
        { status: 400 }
      )
    }

    const contract = await db.employmentContract.delete({ where: { id } })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Contract delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    )
  }
}
