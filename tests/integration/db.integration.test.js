import { describe, expect, it } from "vitest";

import { db } from "@/lib/prisma";

/**
 * Live database checks — strictly read-only, so they are safe to run against
 * a production database. Skipped unless DATABASE_URL is set.
 *
 * The point is to catch drift between prisma/schema.prisma and the deployed
 * database, which unit tests cannot see.
 */
const live = process.env.DATABASE_URL ? describe : describe.skip;

live("database (live, read-only)", () => {
  it("connects", async () => {
    const rows = await db.$queryRaw`select 1 as ok`;
    expect(rows[0].ok).toBe(1);
  });

  it("exposes every model the schema declares", async () => {
    // A select on each model fails loudly if a column was renamed or dropped
    // in the database but not in the schema.
    await expect(db.user.findMany({ take: 1 })).resolves.toBeInstanceOf(Array);
    await expect(db.assessment.findMany({ take: 1 })).resolves.toBeInstanceOf(Array);
    await expect(db.resume.findMany({ take: 1 })).resolves.toBeInstanceOf(Array);
    await expect(db.coverLetter.findMany({ take: 1 })).resolves.toBeInstanceOf(Array);
    await expect(db.industryInsight.findMany({ take: 1 })).resolves.toBeInstanceOf(Array);
  });

  it("has the ATS columns the resume feature writes to", async () => {
    const rows = await db.$queryRawUnsafe(`
      select column_name::text as c
      from information_schema.columns
      where table_schema = 'public' and table_name = 'Resume'
    `);
    const columns = rows.map((r) => r.c);
    expect(columns).toContain("atsScore");
    expect(columns).toContain("feedback");
  });

  it("enforces the unique constraints the actions rely on", async () => {
    const rows = await db.$queryRawUnsafe(`
      select indexdef::text as d from pg_indexes
      where schemaname = 'public' and tablename in ('User', 'Resume', 'IndustryInsight')
    `);
    const defs = rows.map((r) => r.d).join("\n");

    // upsert() in checkUser and saveResume depends on each of these.
    expect(defs).toMatch(/UNIQUE.*"User".*clerkUserId/s);
    expect(defs).toMatch(/UNIQUE.*"Resume".*userId/s);
    expect(defs).toMatch(/UNIQUE.*"IndustryInsight".*industry/s);
  });
});
