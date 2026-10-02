import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// ══════════════════════════════════════════════════════════
// Prisma client singleton, wired for Turso (libSQL).
//
// Turso is SQLite-over-the-network, so it needs a driver
// adapter rather than a plain file:// connection string.
// This same adapter also works fine against a local
// file:./db/custom.db URL, so one setup covers both
// local dev and production — see .env.example for the
// two DATABASE_URL shapes this expects.
//
// The globalThis cache prevents Next.js dev-mode hot reload
// from opening a new libSQL connection on every file save,
// which otherwise exhausts Turso's connection limit fast.
// ══════════════════════════════════════════════════════════

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrismaClient() {
  const adapter = new PrismaLibSQL({
    url: process.env.DATABASE_URL ?? "file:./db/custom.db",
    authToken: process.env.DATABASE_AUTH_TOKEN, // required for Turso, unused for local file DB
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
