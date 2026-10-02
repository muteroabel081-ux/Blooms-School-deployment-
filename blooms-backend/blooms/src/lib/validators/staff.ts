import { z } from "zod";

export const staffCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["TEACHER", "ADMIN", "ACCOUNTANT", "HEADTEACHER"]).optional(),
  hireDate: z.coerce.date().optional(),
});

export const staffUpdateSchema = staffCreateSchema.partial().extend({
  active: z.boolean().optional(),
});
