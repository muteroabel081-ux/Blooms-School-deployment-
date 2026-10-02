import { z } from "zod";

// ══════════════════════════════════════════════════════════
// Shared between src/app/api/students/route.ts (create) and
// src/app/api/students/[id]/route.ts (update, as .partial()).
// Keeping these in one file means the two routes can never
// silently drift on what a "valid student" looks like.
// ══════════════════════════════════════════════════════════

export const studentCreateSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  classId: z.string().cuid().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();
