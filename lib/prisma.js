import { PrismaClient } from "@prisma/client";

const createClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

/**
 * Reuse one client across hot reloads in development. Without this, every
 * reload opens another connection pool and Postgres eventually refuses them.
 */
export const db = globalThis.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
