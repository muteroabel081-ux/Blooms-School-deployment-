import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ══════════════════════════════════════════════════════════
// NextAuth config. Credentials provider checks email+password
// against the User table (bcrypt-hashed password). Session
// carries `role` and `staffId` so API routes can check
// "is this an admin" without a second DB round trip.
//
// NOTE: PrismaAdapter + Credentials provider together means
// sessions are JWT-based, not database-sessions — Credentials
// providers cannot use the database session strategy. This is
// intentional, not a bug, see NextAuth docs on this constraint.
// ══════════════════════════════════════════════════════════

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          staffId: user.staffId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.staffId = user.staffId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.staffId = token.staffId as string | null;
      }
      return session;
    },
  },
};
