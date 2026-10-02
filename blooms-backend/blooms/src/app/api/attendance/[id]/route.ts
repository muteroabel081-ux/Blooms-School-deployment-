import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, noContent, handleApiError } from "@/lib/api-response";
import { attendanceUpdateSchema } from "@/lib/validators/attendance";
import { requireSession } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const record = await prisma.attendance.findUniqueOrThrow({
      where: { id },
      include: { student: true, class: true, takenBy: true },
    });

    return ok(record);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();
    const data = attendanceUpdateSchema.parse(body);

    const record = await prisma.attendance.update({ where: { id }, data });
    return ok(record);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.attendance.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
