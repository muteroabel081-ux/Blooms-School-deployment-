import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { classCreateSchema } from "@/lib/validators/class";
import { requireSession, requireRole } from "@/lib/require-auth";

// GET /api/classes?year=2026
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");

    const classes = await prisma.class.findMany({
      where: year ? { year: Number(year) } : undefined,
      include: {
        homeroomTeacher: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { students: true } },
      },
      orderBy: [{ year: "desc" }, { level: "asc" }, { name: "asc" }],
    });

    return ok(classes);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const data = classCreateSchema.parse(body);

    const cls = await prisma.class.create({ data });
    return created(cls);
  } catch (err) {
    return handleApiError(err);
  }
}
