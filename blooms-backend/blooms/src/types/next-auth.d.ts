import { UserRole } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

// ══════════════════════════════════════════════════════════
// Extends NextAuth's built-in Session/JWT/User types with the
// custom fields set in src/lib/auth.ts callbacks. Without this,
// `session.user.role` and `session.user.staffId` are type
// errors anywhere they're read (every protected route below).
// ══════════════════════════════════════════════════════════

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      staffId: string | null;
    };
  }

  interface User {
    role: UserRole;
    staffId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    staffId: string | null;
  }
}
