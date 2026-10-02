import { z } from "zod";

export const scoreCreateSchema = z.object({
  studentId: z.string().cuid(),
  subject: z.string().min(1),
  term: z.string().min(1),
  year: z.coerce.number().int().min(2000),
  score: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(1).optional(),
  comment: z.string().optional(),
});

export const scoreUpdateSchema = scoreCreateSchema
  .omit({ studentId: true })
  .partial();

// For a teacher entering one subject's scores for a whole class at once.
export const scoreBulkCreateSchema = z.object({
  subject: z.string().min(1),
  term: z.string().min(1),
  year: z.coerce.number().int().min(2000),
  maxScore: z.coerce.number().min(1).optional(),
  entries: z
    .array(
      z.object({
        studentId: z.string().cuid(),
        score: z.coerce.number().min(0),
        comment: z.string().optional(),
      })
    )
    .min(1),
});
