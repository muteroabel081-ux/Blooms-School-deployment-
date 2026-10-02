import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { staffUpdateSchema } from "@/lib/validators/staff";
import { requireSession, requireRole } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const staff = await prisma.staff.findUniqueOrThrow({
      where: { id },
      include: { homeroomClasses: true },
    });

    return ok(staff);
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
    const data = staffUpdateSchema.parse(body);

    const staff = await prisma.staff.update({ where: { id }, data });
    return ok(staff);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/staff/:id — soft delete (active: false), not a hard
// delete. A departed staff member's name still needs to appear on
// the historical scores/attendance they recorded (see Score.recordedBy,
// Attendance.takenBy, which are onDelete: SetNull-by-default relations,
// not Cascade — but deactivating avoids the question entirely).
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const staff = await prisma.staff.update({
      where: { id },
      data: { active: false },
    });

    return ok(staff);
  } catch (err) {
    return handleApiError(err);
  }
}
