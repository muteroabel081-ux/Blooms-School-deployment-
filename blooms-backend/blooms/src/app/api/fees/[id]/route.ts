import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, noContent, handleApiError } from "@/lib/api-response";
import { feeUpdateSchema } from "@/lib/validators/fee";
import { requireSession, requireRole } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const fee = await prisma.fee.findUniqueOrThrow({
      where: { id },
      include: { student: true, payments: { orderBy: { paidAt: "desc" } } },
    });

    return ok(fee);
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/fees/:id — for editing description/amountDue/dueDate,
// or explicitly WAIVED. Does not accept status: PAID/PARTIAL directly;
// those only change via POST /api/fees/:id/payments (see that route).
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();
    const data = feeUpdateSchema.parse(body);

    const fee = await prisma.fee.update({ where: { id }, data });
    return ok(fee);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.fee.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
