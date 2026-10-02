import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { parentId, firstName, lastName, grade, gender, dateOfBirth, address, allergens, nemisNumber, hobbies, birthCertUrl } = body

    if (!parentId || !firstName || !lastName || !grade) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate sequential admission number
    const lastStudent = await db.student.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    const lastNum = lastStudent?.admissionNo ? parseInt(lastStudent.admissionNo.replace('ADM/', '')) || 0 : 0
    const admissionNo = `ADM/${String(lastNum + 1).padStart(3, '0')}`

    // Get parent info for defaults
    const parent = parentId ? await db.parent.findUnique({ where: { id: parentId } }) : null

    const student = await db.student.create({
      data: {
        firstName,
        lastName,
        admissionNo,
        grade,
        gender: gender || 'Male',
        dateOfBirth: dateOfBirth || null,
        parentPhone: parent?.phone || null,
        parentEmail: parent?.email || null,
        address: address || parent?.address || null,
        allergens: allergens || null,
        birthCertUrl: birthCertUrl || null,
        nemisNumber: nemisNumber || null,
        age: dateOfBirth ? String(Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : null,
        hobbies: hobbies || null,
        parentId,
        status: 'Active',
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Register student error:', error)
    return NextResponse.json({ error: 'Failed to register student' }, { status: 500 })
  }
}
