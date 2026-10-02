import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { studentCreateSchema } from "@/lib/validators/student";
import { requireSession } from "@/lib/require-auth";
import { NextResponse } from "next/server";

// GET /api/students?classId=xxx&active=true&q=jane
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const activeParam = searchParams.get("active");
    const q = searchParams.get("q");

    const students = await prisma.student.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(activeParam !== null ? { active: activeParam === "true" } : {}),
        ...(q
          ? {
              OR: [
                { firstName: { contains: q } },
                { lastName: { contains: q } },
                { admissionNo: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        class: { select: { id: true, name: true, level: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return ok(students);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/students
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const data = studentCreateSchema.parse(body);

    const student = await prisma.student.create({
      data: {
        ...data,
        guardianEmail: data.guardianEmail || undefined,
      },
    });

    return created(student);
  } catch (err) {
    return handleApiError(err);
  }
}
