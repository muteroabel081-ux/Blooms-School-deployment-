import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, noContent, handleApiError } from "@/lib/api-response";
import { scoreUpdateSchema } from "@/lib/validators/score";
import { requireSession } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const score = await prisma.score.findUniqueOrThrow({
      where: { id },
      include: { student: true, recordedBy: true },
    });

    return ok(score);
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
    const data = scoreUpdateSchema.parse(body);

    const score = await prisma.score.update({ where: { id }, data });
    return ok(score);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.score.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
