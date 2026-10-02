import { z } from "zod";

export const feeCreateSchema = z.object({
  studentId: z.string().cuid(),
  description: z.string().min(1),
  term: z.string().min(1),
  year: z.coerce.number().int().min(2000),
  amountDue: z.coerce.number().min(0),
  dueDate: z.coerce.date().optional(),
  // PAID/PARTIAL are derived from payments, not settable at creation —
  // see the recompute logic in the payments route.
  status: z.enum(["UNPAID", "WAIVED"]).optional(),
});

export const feeUpdateSchema = feeCreateSchema.omit({ studentId: true }).partial();

export const paymentCreateSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.string().optional(),
  reference: z.string().optional(),
  paidAt: z.coerce.date().optional(),
});
