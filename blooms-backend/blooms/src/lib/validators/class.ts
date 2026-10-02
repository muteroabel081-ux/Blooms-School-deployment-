import { z } from "zod";

export const classCreateSchema = z.object({
  name: z.string().min(1),
  level: z.coerce.number().int().min(1),
  year: z.coerce.number().int().min(2000),
  homeroomTeacherId: z.string().cuid().optional(),
});

export const classUpdateSchema = classCreateSchema.partial();
