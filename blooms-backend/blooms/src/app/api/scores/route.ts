import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { scoreCreateSchema, scoreBulkCreateSchema } from "@/lib/validators/score";
import { requireSession } from "@/lib/require-auth";

// GET /api/scores?studentId=xxx&subject=Math&term=Term%201&year=2026
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const subject = searchParams.get("subject");
    const term = searchParams.get("term");
    const year = searchParams.get("year");

    const scores = await prisma.score.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(subject ? { subject } : {}),
        ...(term ? { term } : {}),
        ...(year ? { year: Number(year) } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(scores);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/scores — single score.
// POST /api/scores?bulk=true — whole-class entry in one request,
// so a teacher entering 30 students' Math scores for Term 1 isn't
// making 30 separate requests. Uses a transaction so a partial
// failure (e.g. one bad studentId) doesn't leave 29 scores saved
// and 1 missing with no clear signal of what happened.
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const isBulk = searchParams.get("bulk") === "true";
    const body = await req.json();

    if (isBulk) {
      const data = scoreBulkCreateSchema.parse(body);
      const recordedById = session.user.staffId ?? undefined;

      const scores = await prisma.$transaction(
        data.entries.map((entry) =>
          prisma.score.create({
            data: {
              studentId: entry.studentId,
              subject: data.subject,
              term: data.term,
              year: data.year,
              score: entry.score,
              maxScore: data.maxScore,
              comment: entry.comment,
              recordedById,
            },
          })
        )
      );

      return created(scores);
    }

    const data = scoreCreateSchema.parse(body);
    const score = await prisma.score.create({
      data: {
        ...data,
        recordedById: session.user.staffId ?? undefined,
      },
    });

    return created(score);
  } catch (err) {
    return handleApiError(err);
  }
}
