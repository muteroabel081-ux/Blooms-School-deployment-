import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { feeCreateSchema } from "@/lib/validators/fee";
import { requireSession, requireRole } from "@/lib/require-auth";

// GET /api/fees?studentId=xxx&status=UNPAID&term=Term%201&year=2026
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const term = searchParams.get("term");
    const year = searchParams.get("year");

    const fees = await prisma.fee.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status: status as any } : {}),
        ...(term ? { term } : {}),
        ...(year ? { year: Number(year) } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
        payments: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return ok(fees);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/fees — accountant/admin only, since this creates a
// billing obligation on a student's account.
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const data = feeCreateSchema.parse(body);

    const fee = await prisma.fee.create({ data });
    return created(fee);
  } catch (err) {
    return handleApiError(err);
  }
}
