import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// ══════════════════════════════════════════════════════════
// Shared response shaping so every route in src/app/api/**
// returns errors the same way. The frontend can rely on
// `{ error: string, details?: unknown }` on any non-2xx
// response from any endpoint in this backend.
// ══════════════════════════════════════════════════════════

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/**
 * Turns a caught error from inside a route handler's try/catch
 * into a consistent JSON error response. Handles the four error
 * shapes every route here will actually throw: Zod validation
 * failures, Prisma known errors (unique constraint, not found,
 * restrict-constraint violation), and anything else.
 */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: err.flatten() },
      { status: 400 }
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return NextResponse.json(
        {
          error: "A record with this value already exists",
          details: err.meta,
        },
        { status: 409 }
      );
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (err.code === "P2003") {
      // Restrict-constraint violation. Currently only reachable via
      // Attendance.classId (onDelete: Restrict) — see the comment on
      // DELETE /api/classes/[id] for why that relation isn't Cascade.
      return NextResponse.json(
        {
          error:
            "Cannot delete this record because other records still reference it",
          details: err.meta,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Database error", details: err.code },
      { status: 400 }
    );
  }

  console.error("Unhandled API error:", err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
