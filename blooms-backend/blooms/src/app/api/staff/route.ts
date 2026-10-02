import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api-response";
import { staffCreateSchema } from "@/lib/validators/staff";
import { requireSession, requireRole } from "@/lib/require-auth";

// GET /api/staff?role=TEACHER&active=true
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const activeParam = searchParams.get("active");

    const staff = await prisma.staff.findMany({
      where: {
        ...(role ? { role: role as any } : {}),
        ...(activeParam !== null ? { active: activeParam === "true" } : {}),
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    return ok(staff);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/staff — admin only, since this creates a staff record
// that can subsequently be linked to a login (see /api/staff/:id)
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN");
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const data = staffCreateSchema.parse(body);

    const staff = await prisma.staff.create({ data });
    return created(staff);
  } catch (err) {
    return handleApiError(err);
  }
}
