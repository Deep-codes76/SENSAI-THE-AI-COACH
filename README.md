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
| **Mock interviews** | Technical, system design or behavioural rounds — ten role-specific questions at a time, with explanations, a scored history, a performance trend and an AI tip derived from what you got wrong. |
| **Application tracker** | A pipeline board from saved through to offer, with notes, posting links and a response rate that counts only what you actually submitted. |
| **Skill coverage** | Your profile's skills matched against what the market is hiring for, with the gap listed explicitly. |
| **Command palette** | `⌘K` / `Ctrl-K` to reach any surface or action. |

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

> **Upgrading an existing deployment:** this release adds the `JobApplication`
> table. Run `npx prisma migrate deploy` before serving it — until you do, the
> tracker page renders an explicit "run migrations" notice rather than failing.
>
> If your database predates the committed migration history, `0_init` will
> fail because the tables already exist. Baseline it once with
> `npx prisma migrate resolve --applied 0_init`, then run
> `npx prisma migrate deploy` again.
>
> Note that `migrate resolve --applied` only *records* a migration as done; it
> never executes the SQL. That is why the tracker table ships in its own
> migration, written idempotently so it applies correctly whether the database
> was baselined or built from scratch.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk client key |
| `CLERK_SECRET_KEY` | yes | Clerk server key |
| `GEMINI_API_KEY` | yes | Google Gemini |
| `GEMINI_MODEL` | no | Defaults to `gemini-3.5-flash` |
| `NEXT_PUBLIC_SITE_URL` | no | Absolute URL for Open Graph tags; auto-detected on Render and Vercel |
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
- **Motion is progressive enhancement.** Scroll reveals are a CSS scroll timeline layered over content that is visible by default, so nothing can be stranded at `opacity: 0` if a script fails.
- **Neon runs over HTTP.** Prisma uses the Neon serverless adapter when `DATABASE_URL` points at Neon, which suits serverless runtimes and removes the per-invocation TCP handshake. Any other Postgres host falls back to the standard driver, so the project is not locked to one provider.
- **Lookups are own-key checked.** Indexing a config map by a user-supplied string resolves inherited keys — `"constructor"` is truthy on any object — so status and category lookups go through a `Set` of known keys. A unit test covers exactly that case.

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
| `npm run test:integration` | Live checks against Gemini and the database (skipped without credentials) |

## Tests

55 unit tests cover the parts where a silent bug is most expensive: the markdown ⇄ form codec (including a full round-trip), the validation schemas, AI response parsing, the retry policy, skill matching and the application funnel maths.

```bash
npm run test            # hermetic, no credentials needed
npm run test:integration  # live Gemini + database, skipped without credentials
```

The integration suite exists because the unit tests mock the model away, and
the failure that actually bites in production is a retired model id or schema
drift — neither of which a mock can catch.

## Deploying

### Render

A [Blueprint](https://render.com/docs/blueprint-spec) is committed as `render.yaml`.
In the Render dashboard choose **New → Blueprint**, pick this repository, and
supply the five secrets it prompts for:

| Variable | Where it comes from |
|---|---|
| `DATABASE_URL` | Neon → Connection string (the **pooled** one) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API keys |
| `CLERK_SECRET_KEY` | Clerk → API keys |
| `GEMINI_API_KEY` | Google AI Studio |

`NEXT_PUBLIC_SITE_URL` is not among them: the app falls back to
`RENDER_EXTERNAL_URL`, which Render sets to the service's own public URL (and
to `VERCEL_URL` on Vercel). Set it explicitly only when serving from a custom
domain.

To configure it by hand instead, create a **Web Service** with:

- **Build command** — `npm ci && npx prisma migrate deploy && npm run build`
- **Start command** — `npm start`
- **Health check path** — `/`
- **Node version** — 20 (pinned by `.node-version`)

If the build fails, run `npm run check:env` — it validates every required
variable and names the problem. It also runs as the second step of the build
command, because Prisma's own error for a missing `DATABASE_URL` is
"the URL must start with the protocol `postgresql://`", which points at the
connection string rather than at the variable being absent.

> **Do not quote values in a dashboard.** `.env` files strip surrounding
> quotes; Render stores them literally, so `DATABASE_URL="postgresql://…"`
> arrives with a leading `"` and fails validation.

Three things worth knowing:

- Migrations run in the build command rather than a `preDeployCommand`, because
  that field requires a paid compute plan. `migrate deploy` is idempotent, so
  running it on every deploy is safe.
- `NEXT_PUBLIC_*` values are inlined into the client bundle at build time, so
  changing one requires a rebuild, not just a restart.
- `next start` already binds `0.0.0.0` and reads Render's `PORT`, so no extra
  flags are needed.

After the first deploy, add the Render URL to Clerk under **Domains**, and
point the Inngest serve endpoint at `/api/inngest` so the weekly insight
refresh runs.

On Render's free compute plan the service sleeps after inactivity, so the
first request after an idle period is slow. Use a paid instance if that
matters.

### Anywhere else

The app is a standard Next.js server — Vercel, Fly, Railway and a plain
container all work. Set the same environment variables, run
`npx prisma migrate deploy` before serving, and start with `next start`.

For a public demo with no backing services, set `NEXT_PUBLIC_DEMO_MODE=1` and
deploy; no database, auth instance or AI key is required.

---

Built by **Deepanshu**.
