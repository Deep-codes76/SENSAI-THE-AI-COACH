import { PrismaClient } from "@prisma/client";

/**
 * Prisma client.
 *
 * Neon connections go over its HTTP/WebSocket driver rather than a raw TCP
 * socket. That is what makes the app work on serverless runtimes, where a
 * long-lived pooled socket is the wrong shape, and it removes the cold-start
 * cost of opening a Postgres connection per invocation.
 *
 * Any other Postgres host falls back to the standard driver, so the project
 * is not locked to one provider.
 */
const isNeon = (process.env.DATABASE_URL || "").includes("neon.tech");

function createClient() {
  const log = process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

  if (isNeon) {
    try {
      // Required at runtime only, and only for Neon, so a non-Neon deployment
      // never has to install the adapter.
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const adapter = new PrismaNeon({
        connectionString: process.env.DATABASE_URL,
      });
      return new PrismaClient({ adapter, log });
    } catch (error) {
      console.warn(
        "Neon adapter unavailable, falling back to the default driver:",
        error.message
      );
    }
  }

  return new PrismaClient({ log });
}

/**
 * Reuse one client across hot reloads in development. Without this, every
 * reload opens another connection pool and Postgres eventually refuses them.
 */
export const db = globalThis.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
