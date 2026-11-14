-- Adds the job application tracker.
--
-- Written idempotently on purpose, because this table can arrive by two
-- different routes:
--
--   * a fresh database runs 0_init, which already contains it, and then
--     reaches this migration, where every statement is a no-op;
--   * a database baselined with `migrate resolve --applied 0_init` never
--     executed that SQL, so this migration is what actually creates it.
--
-- Both paths end in the same schema.

CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "url" TEXT,
    "source" TEXT,
    "salary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobApplication_userId_status_idx"
    ON "JobApplication"("userId", "status");

CREATE INDEX IF NOT EXISTS "JobApplication_userId_createdAt_idx"
    ON "JobApplication"("userId", "createdAt");

-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, so the duplicate is caught.
DO $$
BEGIN
    ALTER TABLE "JobApplication"
        ADD CONSTRAINT "JobApplication_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN duplicate_table THEN NULL;
END
$$;
