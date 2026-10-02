import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { admissionNo: { contains: search } },
          ],
        }
      : {}

    const students = await db.student.findMany({
      where,
      include: { parent: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Students list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, grade, gender, dateOfBirth, parentPhone, parentEmail, address, profileImage, parentId } = body
    let { admissionNo } = body

    if (!firstName || !lastName || !grade) {
      return NextResponse.json(
        { error: 'firstName, lastName, and grade are required' },
        { status: 400 }
      )
    }

    if (!admissionNo) {
      const count = await db.student.count();
      admissionNo = `ADM/${String(count + 101).padStart(3, '0')}`;
    }

    const student = await db.student.create({
      data: {
        firstName,
        lastName,
        admissionNo,
        grade,
        gender: gender || 'Male',
        dateOfBirth: dateOfBirth || null,
        parentPhone: parentPhone || null,
        parentEmail: parentEmail || null,
        address: address || null,
        profileImage: profileImage || null,
        parentId: parentId || null,
      },
      include: { parent: true },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: unknown) {
    console.error('Student create error:', error)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Admission number already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create student' },
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
        { error: 'Student id is required' },
        { status: 400 }
      )
    }

    // Delete related fees first
    await db.fee.deleteMany({ where: { studentId: id } })
    const student = await db.student.delete({ where: { id } })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Student delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}