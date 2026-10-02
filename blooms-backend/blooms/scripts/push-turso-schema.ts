import { execFileSync } from "node:child_process";
import { createClient } from "@libsql/client";

const databaseUrl = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!databaseUrl?.startsWith("libsql://")) {
  throw new Error(
    "DATABASE_URL must be a libsql:// Turso URL when running db:turso:push.",
  );
}

if (!authToken) {
  throw new Error("DATABASE_AUTH_TOKEN is required when running db:turso:push.");
}

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const schemaSql = execFileSync(
  prismaCommand,
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--script",
  ],
  { encoding: "utf8" },
);

const client = createClient({ url: databaseUrl, authToken });

try {
  await client.executeMultiple(schemaSql);
  console.log("Turso schema applied successfully.");
} finally {
  client.close();
}
