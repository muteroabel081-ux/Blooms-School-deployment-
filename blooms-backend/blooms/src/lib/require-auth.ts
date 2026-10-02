import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

// ══════════════════════════════════════════════════════════
// Route-handler auth guards. Usage inside any route.ts:
//
//   const session = await requireSession();
//   if (session instanceof NextResponse) return session; // 401
//
//   const admin = await requireRole("ADMIN");
//   if (admin instanceof NextResponse) return admin; // 401 or 403
// ══════════════════════════════════════════════════════════

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}
