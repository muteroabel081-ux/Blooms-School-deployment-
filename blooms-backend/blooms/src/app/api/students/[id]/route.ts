import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, noContent, handleApiError } from "@/lib/api-response";
import { studentUpdateSchema } from "@/lib/validators/student";
import { requireSession, requireRole } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/students/:id — full profile, used by the student detail page
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;

    const student = await prisma.student.findUniqueOrThrow({
      where: { id },
      include: {
        class: true,
        scores: { orderBy: { createdAt: "desc" } },
        fees: { include: { payments: true }, orderBy: { createdAt: "desc" } },
        attendance: { orderBy: { date: "desc" }, take: 30 },
      },
    });

    return ok(student);
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/students/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();
    const data = studentUpdateSchema.parse(body);

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        guardianEmail: data.guardianEmail || undefined,
      },
    });

    return ok(student);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/students/:id — admin only, since this cascades to
// the student's scores/fees/attendance (see schema onDelete: Cascade)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.student.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
