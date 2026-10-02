import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { paymentCreateSchema } from "@/lib/validators/fee";
import { requireRole } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/fees/:id/payments — payment history for one fee
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const payments = await prisma.payment.findMany({
      where: { feeId: id },
      orderBy: { paidAt: "desc" },
    });

    return ok(payments);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/fees/:id/payments — record a payment against a fee.
//
// This is the ONLY way Fee.status ever changes to PAID or PARTIAL.
// It recomputes status from the actual sum of all payments against
// this fee, rather than trusting a client to send the right status
// alongside the payment — those two values could otherwise drift
// (e.g. a client sends status: PAID but the amount was actually a
// partial payment). Wrapped in a transaction so the payment insert
// and the status recompute can never land inconsistently if one
// half fails.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();
    const data = paymentCreateSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const fee = await tx.fee.findUniqueOrThrow({ where: { id } });

      const payment = await tx.payment.create({
        data: { ...data, feeId: id },
      });

      const allPayments = await tx.payment.findMany({ where: { feeId: id } });
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      const status =
        fee.status === "WAIVED"
          ? "WAIVED"
          : totalPaid >= fee.amountDue
            ? "PAID"
            : totalPaid > 0
              ? "PARTIAL"
              : "UNPAID";

      const updatedFee = await tx.fee.update({
        where: { id },
        data: { status },
        include: { payments: true },
      });

      return { payment, fee: updatedFee };
    });

    return created(result);
  } catch (err) {
    return handleApiError(err);
  }
}
