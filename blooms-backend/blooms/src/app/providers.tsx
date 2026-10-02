"use client";

import { SessionProvider } from "next-auth/react";

// Wraps the app in NextAuth's client-side session context.
// Without this, signIn()/useSession() (used in src/app/login/page.tsx
// and anywhere else that needs client-side auth state) throw at
// runtime — SessionProvider is not optional infrastructure here.

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
