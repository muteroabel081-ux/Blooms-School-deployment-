import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import {
  attendanceCreateSchema,
  attendanceBulkSchema,
} from "@/lib/validators/attendance";
import { requireSession } from "@/lib/require-auth";

// GET /api/attendance?classId=xxx&date=2026-09-09&studentId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const dateParam = searchParams.get("date");

    const attendance = await prisma.attendance.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(dateParam ? { date: new Date(dateParam) } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
        takenBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { date: "desc" },
    });

    return ok(attendance);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/attendance — single mark.
// POST /api/attendance?bulk=true — whole-class daily marking in one
// request. Uses upsert (not create) on each entry because
// Attendance has a @@unique([studentId, date]) constraint — if a
// teacher re-submits the same day's register (e.g. correcting one
// student), this updates the existing rows instead of failing on
// the unique constraint for every student already marked today.
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const isBulk = searchParams.get("bulk") === "true";
    const body = await req.json();
    const takenById = session.user.staffId ?? undefined;

    if (isBulk) {
      const data = attendanceBulkSchema.parse(body);

      const records = await prisma.$transaction(
        data.entries.map((entry) =>
          prisma.attendance.upsert({
            where: {
              studentId_date: { studentId: entry.studentId, date: data.date },
            },
            create: {
              studentId: entry.studentId,
              classId: data.classId,
              date: data.date,
              status: entry.status,
              note: entry.note,
              takenById,
            },
            update: {
              status: entry.status,
              note: entry.note,
              takenById,
            },
          })
        )
      );

      return created(records);
    }

    const data = attendanceCreateSchema.parse(body);
    const record = await prisma.attendance.upsert({
      where: {
        studentId_date: { studentId: data.studentId, date: data.date },
      },
      create: { ...data, takenById },
      update: { status: data.status, note: data.note, takenById },
    });

    return created(record);
  } catch (err) {
    return handleApiError(err);
  }
}
