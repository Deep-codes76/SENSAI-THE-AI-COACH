#!/usr/bin/env node
/**
 * Fail the build early, with a message that says what to fix.
 *
 * Prisma's own error for an unset DATABASE_URL is
 * "the URL must start with the protocol postgresql://", which describes the
 * symptom rather than the cause and sends people looking at their connection
 * string instead of at whether the variable reached the build at all.
 *
 * The quoting check matters because .env files strip surrounding quotes but
 * dashboard UIs (Render, Vercel, Railway) store them literally, so a value
 * pasted with quotes arrives as `"postgresql://…` and fails validation.
 */

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

const checks = [
  {
    key: "DATABASE_URL",
    hint: "Neon dashboard → your project → Connection string (use the pooled one)",
    validate: (v) =>
      /^postgres(ql)?:\/\//.test(v)
        ? null
        : "must start with postgresql:// or postgres://",
  },
  {
    key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    hint: "Clerk dashboard → API keys",
    validate: (v) => (v.startsWith("pk_") ? null : "should start with pk_"),
  },
  {
    key: "CLERK_SECRET_KEY",
    hint: "Clerk dashboard → API keys",
    validate: (v) => (v.startsWith("sk_") ? null : "should start with sk_"),
  },
  {
    key: "GEMINI_API_KEY",
    hint: "https://aistudio.google.com/apikey",
    validate: () => null,
  },
];

const problems = [];

for (const { key, hint, validate } of checks) {
  const raw = process.env[key];

  if (raw === undefined || raw.trim() === "") {
    problems.push(`${key} is not set.\n      Get it from: ${hint}`);
    continue;
  }

  if (/^['"]|['"]$/.test(raw.trim())) {
    problems.push(
      `${key} is wrapped in quotes.\n` +
        `      A .env file strips quotes, but a dashboard stores them literally.\n` +
        `      Re-enter the value without the surrounding " or '.`
    );
    continue;
  }

  if (raw !== raw.trim()) {
    problems.push(`${key} has leading or trailing whitespace. Re-enter it.`);
    continue;
  }

  const failure = validate(raw.trim());
  if (failure) {
    problems.push(`${key} ${failure}.\n      Get it from: ${hint}`);
  }
}

if (DEMO) {
  console.log(
    "✓ env check skipped — NEXT_PUBLIC_DEMO_MODE=1 runs against fixtures."
  );
  process.exit(0);
}

if (problems.length === 0) {
  console.log("✓ env check passed");
  process.exit(0);
}

console.error(
  [
    "",
    "✗ Environment is not configured correctly:",
    "",
    ...problems.map((p) => `  • ${p}`),
    "",
    "  Locally:  copy .env.example to .env and fill it in.",
    "  On Render: Dashboard → your service → Environment.",
    "  To build without any credentials, set NEXT_PUBLIC_DEMO_MODE=1.",
    "",
  ].join("\n")
);

process.exit(1);
