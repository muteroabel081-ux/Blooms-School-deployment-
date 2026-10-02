import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, noContent, handleApiError } from "@/lib/api-response";
import { classUpdateSchema } from "@/lib/validators/class";
import { requireSession, requireRole } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const cls = await prisma.class.findUniqueOrThrow({
      where: { id },
      include: {
        homeroomTeacher: true,
        students: { orderBy: [{ lastName: "asc" }] },
      },
    });

    return ok(cls);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();
    const data = classUpdateSchema.parse(body);

    const cls = await prisma.class.update({ where: { id }, data });
    return ok(cls);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/classes/:id — students in this class are NOT cascade
// deleted (see schema: Student.classId is a nullable, non-cascading
// relation). Deleting a class just orphans its students to classId:
// null; it does not delete them. This is deliberate — closing out a
// class at year-end should never delete the students in it.
//
// However, if this class has ANY attendance history, this call will
// fail with a 409 (P2003, mapped in handleApiError) instead of
// deleting. Attendance.classId uses onDelete: Restrict, not Cascade
// — a class can only have one cascading relation in SQLite, and
// Student already holds that slot. Restrict was chosen over Cascade
// here anyway, independent of that constraint: silently deleting a
// class's entire attendance record because someone deleted the
// class row would erase real historical data. If you need to
// decommission a class that has attendance history, migrate or
// export that history first, then delete.
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.class.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
