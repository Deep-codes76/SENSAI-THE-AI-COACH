<div align="center">

# Sensai — AI Career Coach

**Industry insights, an ATS-scored resume builder, tailored cover letters and AI mock interviews — in one profile.**

Next.js 15 · React 19 · Prisma · Postgres · Clerk · Google Gemini · Inngest · Tailwind

</div>

---

## What it does

| | |
|---|---|
| **Industry insights** | Salary bands by role, demand level, growth rate, in-demand skills and market trends for your field — generated per industry and refreshed weekly by a scheduled job. |
| **Resume builder** | A structured form that round-trips losslessly to markdown. Work in either representation and export a clean A4 PDF. |
| **ATS scoring** | Scores the resume the way an applicant tracking system reads it, with strengths, concrete improvements and the keywords you are missing. |
| **Cover letters** | A tailored draft per posting, generated from your profile and the job description, editable in markdown and exportable to PDF. |
| **Mock interviews** | Ten role-specific multiple-choice questions at a time, with explanations, a scored history, a performance trend and an AI tip derived from what you got wrong. |

## Try it without any API keys

```bash
npm install
npm run dev:demo
```

Demo mode runs the entire application against seeded fixtures — no database, no Clerk instance, no Gemini key. It is also what CI builds, so the pipeline needs no secrets.

## Running it for real

```bash
cp .env.example .env
# fill in DATABASE_URL, the Clerk keys and GEMINI_API_KEY
npx prisma migrate deploy
npm run dev
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk client key |
| `CLERK_SECRET_KEY` | yes | Clerk server key |
| `GEMINI_API_KEY` | yes | Google Gemini |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.0-flash` |
| `NEXT_PUBLIC_SITE_URL` | no | Absolute URL for Open Graph tags |
| `NEXT_PUBLIC_DEMO_MODE` | no | `1` runs against fixtures |

## Architecture

```
Browser
  │
  ├── Server Components ──────── read path: Prisma → Postgres
  │     Suspense + skeletons for every async boundary
  │
  ├── Server Actions ─────────── write path: validate → authorize → persist
  │     every action resolves the Clerk user to a row via requireUser()
  │     every query is scoped by userId
  │
  ├── lib/ai.js ──────────────── single Gemini entry point
  │     JSON repair · zod validation · bounded retry with backoff
  │
  └── Inngest (cron) ─────────── weekly regeneration of industry insights
        one step per industry, so one bad response cannot abort the run
```

### Design decisions worth noting

- **AI output is never trusted.** Every structured response is parsed defensively (fences, prose preambles, partial output) and then validated with a zod schema before it reaches the database or the UI.
- **Slow work stays out of transactions.** Insight generation takes seconds; it runs *before* the Prisma transaction rather than inside it, so the connection pool is never held open on a network call.
- **Authorization is a query constraint, not a check.** Reads use `findFirst({ where: { id, userId } })` and writes use `updateMany` / `deleteMany` with the same scope, so a forged id touches zero rows instead of leaking a record's existence.
- **The heavy client deps are lazy.** The markdown editor and PDF generator are dynamically imported, which took the resume route from 737 kB to 163 kB of first-load JS.
- **Motion is progressive enhancement.** Scroll reveals are armed by an inline script and backed by a timeout, so content can never be stranded at `opacity: 0`.

## Project layout

```
actions/          Server Actions — one module per feature
app/(auth)/       Clerk sign-in and sign-up
app/(main)/       Authenticated product surfaces
app/lib/          Zod schemas and the markdown ⇄ form codec
components/       Design system and shared UI
components/ui/    shadcn/ui primitives
lib/              Prisma client, auth helper, AI client, PDF export, demo data
lib/inngest/      Scheduled insight regeneration
prisma/           Schema and migrations
tests/            Vitest unit tests
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run dev:demo` | Dev server against fixtures, no keys needed |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run coverage` | Vitest with a coverage report |

## Tests

40 unit tests cover the parts where a silent bug is most expensive: the markdown ⇄ form codec (including a full round-trip), the validation schemas, AI response parsing and the retry policy.

```bash
npm run test
```

## Deploying

Deploys to Vercel as-is. Set the environment variables above, point `DATABASE_URL` at a pooled connection, and register `/api/inngest` as the Inngest serve endpoint so the weekly refresh runs.

For a public demo with no backing services, set `NEXT_PUBLIC_DEMO_MODE=1` and deploy — nothing else is required.

---

Built by **Deepanshu**.
