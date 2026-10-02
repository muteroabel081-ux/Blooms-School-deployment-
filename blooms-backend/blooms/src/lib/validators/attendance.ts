import { z } from "zod";

const statusEnum = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

export const attendanceCreateSchema = z.object({
  studentId: z.string().cuid(),
  classId: z.string().cuid(),
  date: z.coerce.date(),
  status: statusEnum.optional(),
  note: z.string().optional(),
});

export const attendanceUpdateSchema = z.object({
  status: statusEnum.optional(),
  note: z.string().optional(),
});

// For a homeroom teacher marking a whole class at once for one date.
export const attendanceBulkSchema = z.object({
  classId: z.string().cuid(),
  date: z.coerce.date(),
  entries: z
    .array(
      z.object({
        studentId: z.string().cuid(),
        status: statusEnum,
        note: z.string().optional(),
      })
    )
    .min(1),
});
