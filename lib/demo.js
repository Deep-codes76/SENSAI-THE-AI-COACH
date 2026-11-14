/**
 * Demo mode.
 *
 * With NEXT_PUBLIC_DEMO_MODE=1 the app runs end-to-end against seeded
 * fixtures: no database, no Clerk instance and no Gemini key. It exists so
 * the project can be deployed as a public, link-shareable demo and so the UI
 * can be rendered in CI without provisioning any third-party service.
 *
 * Every demo branch is behind this one flag, and each server action checks it
 * before touching the real integrations.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const demoUser = {
  id: "demo-user",
  clerkUserId: "demo-user",
  email: "demo@sensai.app",
  name: "Demo User",
  imageUrl: null,
  industry: "tech-software-development",
  experience: 4,
  bio: "Full-stack engineer focused on product velocity and developer experience.",
  skills: ["React", "Next.js", "TypeScript", "PostgreSQL", "AWS"],
};

export const demoInsights = {
  id: "demo-insight",
  industry: "tech-software-development",
  salaryRanges: [
    { role: "Frontend Engineer", min: 85000, max: 155000, median: 118000, location: "Remote" },
    { role: "Backend Engineer", min: 95000, max: 170000, median: 128000, location: "Remote" },
    { role: "Full-Stack Engineer", min: 90000, max: 165000, median: 124000, location: "Remote" },
    { role: "DevOps Engineer", min: 100000, max: 180000, median: 136000, location: "Remote" },
    { role: "Engineering Manager", min: 140000, max: 230000, median: 180000, location: "Remote" },
  ],
  growthRate: 12.4,
  demandLevel: "High",
  topSkills: ["TypeScript", "React", "Kubernetes", "System Design", "Go"],
  marketOutlook: "Positive",
  keyTrends: [
    "AI pair-programming is now assumed in day-to-day workflows",
    "Platform engineering teams are absorbing classic DevOps scope",
    "Edge runtimes are displacing traditional server deployments",
    "Type-safe end-to-end stacks are the default for new products",
    "Hiring is concentrated in mid and senior bands",
  ],
  recommendedSkills: [
    "Distributed systems",
    "Observability",
    "LLM application design",
    "Infrastructure as code",
    "Performance profiling",
  ],
  lastUpdated: new Date("2026-11-09T00:00:00Z"),
  nextUpdate: new Date("2026-11-16T00:00:00Z"),
};

const demoQuestions = [
  {
    question: "What does the `key` prop actually do in a React list?",
    options: [
      "Sets the DOM id of the element",
      "Gives React a stable identity so it can match elements across renders",
      "Sorts the list automatically",
      "Memoizes the component",
    ],
    correctAnswer:
      "Gives React a stable identity so it can match elements across renders",
    explanation:
      "Keys let the reconciler pair previous and next children; using the array index breaks that pairing when the list reorders.",
  },
  {
    question: "In Postgres, what does an index on a low-cardinality column cost you?",
    options: [
      "Nothing, indexes are always free",
      "Write amplification with little read benefit",
      "It makes sequential scans impossible",
      "It forces the table to be rewritten",
    ],
    correctAnswer: "Write amplification with little read benefit",
    explanation:
      "Every insert and update must maintain the index, while the planner will often still prefer a sequential scan when the column has few distinct values.",
  },
  {
    question: "What problem do Next.js Server Actions solve?",
    options: [
      "They replace CSS modules",
      "They let a client component invoke server code without hand-writing an API route",
      "They make all pages static",
      "They are a state management library",
    ],
    correctAnswer:
      "They let a client component invoke server code without hand-writing an API route",
    explanation:
      "The framework handles the transport and serialisation, so mutations live next to the component that triggers them.",
  },
];

const withResults = (questions, correctCount) =>
  questions.map((q, i) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: i < correctCount ? q.correctAnswer : q.options[0],
    isCorrect: i < correctCount,
    explanation: q.explanation,
  }));

export const demoAssessments = [
  {
    id: "demo-a3",
    quizScore: 90,
    category: "Technical",
    improvementTip:
      "Your fundamentals are solid — push into distributed systems trade-offs next, especially consistency models.",
    questions: withResults(demoQuestions, 3),
    createdAt: new Date("2026-11-10T10:00:00Z"),
  },
  {
    id: "demo-a2",
    quizScore: 70,
    category: "Technical",
    improvementTip:
      "Spend some time on database indexing strategy; it came up more than once.",
    questions: withResults(demoQuestions, 2),
    createdAt: new Date("2026-11-03T10:00:00Z"),
  },
  {
    id: "demo-a1",
    quizScore: 50,
    category: "Technical",
    improvementTip:
      "Review React's reconciliation model — it underpins several of these questions.",
    questions: withResults(demoQuestions, 1),
    createdAt: new Date("2026-10-27T10:00:00Z"),
  },
];

export const demoQuiz = demoQuestions;

export const demoResume = {
  id: "demo-resume",
  userId: "demo-user",
  atsScore: 78,
  feedback: null,
  content: `## <div align="center">Demo User</div>
\n\n<div align="center">\n\n📧 demo@sensai.app | 📱 +1 555 0100 | 💼 [LinkedIn](https://linkedin.com/in/demo)\n\n</div>

## Professional Summary

Full-stack engineer with four years building product-facing web applications. Shipped a design-system migration across 40+ screens and cut p95 page load by 38%.

## Skills

TypeScript, React, Next.js, Node.js, PostgreSQL, Prisma, AWS, Terraform, Playwright

## Work Experience

### Software Engineer @ Northwind Labs
2023-06 - Present

Owned the checkout surface end to end. Reduced failed payment retries by 22% by reworking idempotency handling, and introduced contract tests that cut production incidents in the area to zero over two quarters.

### Junior Engineer @ Bluepeak
2022-01 - 2023-05

Built internal tooling used by 60 support agents. Migrated a legacy jQuery admin to React, halving median task completion time.

## Education

### B.Tech, Electronics and Communication @ Delhi Technological University
2018-08 - 2022-05

Graduated with distinction. Final-year project on real-time signal classification.

## Projects

### Sensai — AI Career Coach @ Personal
2026-09 - Present

Next.js 15 application pairing Gemini with Prisma and Clerk to generate industry insights, ATS-scored resumes, tailored cover letters and mock interviews.
`,
};

export const demoCoverLetters = [
  {
    id: "demo-cl-1",
    jobTitle: "Senior Frontend Engineer",
    companyName: "Northwind Labs",
    status: "completed",
    jobDescription:
      "We are looking for a senior frontend engineer to own our design system and lead the migration of our checkout surface to React Server Components.",
    createdAt: new Date("2026-11-08T09:00:00Z"),
    content: `**Demo User**
demo@sensai.app

Dear Hiring Team at Northwind Labs,

I am writing to apply for the Senior Frontend Engineer role. Over the last four years I have specialised in exactly the problem your posting describes: owning a design system while migrating a high-traffic surface to a newer rendering model.

At my current company I led the migration of our checkout flow to React Server Components, reducing client bundle size by 41% and improving p95 interaction latency from 410ms to 180ms. I also maintain our component library, which is now consumed by three product teams.

What draws me to Northwind is that the design system is treated as a product rather than a side effect. I would like to bring that same discipline to your checkout migration.

Thank you for your consideration.

Sincerely,
Demo User`,
  },
  {
    id: "demo-cl-2",
    jobTitle: "Platform Engineer",
    companyName: "Bluepeak",
    status: "completed",
    jobDescription:
      "Platform engineer to build internal developer tooling, CI pipelines and deployment infrastructure for a 40-person engineering org.",
    createdAt: new Date("2026-10-30T09:00:00Z"),
    content: `**Demo User**
demo@sensai.app

Dear Bluepeak Team,

I am applying for the Platform Engineer position. My background sits at the seam between product engineering and infrastructure, which is where internal tooling tends to succeed or fail.

I rebuilt our CI pipeline around remote caching and test sharding, taking the median pull request from 14 minutes to under 4. I also wrote the Terraform modules that now provision every preview environment.

I would welcome the chance to discuss how I could help your team.

Sincerely,
Demo User`,
  },
];

export const demoAtsFeedback = {
  score: 78,
  summary:
    "A strong, parseable resume with real metrics. The main gap is keyword coverage for the infrastructure roles you are targeting.",
  strengths: [
    "Quantified outcomes in every experience bullet",
    "Clean single-column structure an ATS can parse",
    "Consistent reverse-chronological ordering",
    "Skills section uses the exact terms found in job postings",
  ],
  improvements: [
    "Add a line on team size or scope of ownership for the current role",
    "Surface testing and observability work earlier in the summary",
    "Include one open-source or community contribution if you have one",
  ],
  missingKeywords: [
    "Kubernetes",
    "CI/CD",
    "GraphQL",
    "Observability",
    "System design",
  ],
};

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const demoApplications = [
  {
    id: "demo-app-1",
    company: "Northwind Labs",
    role: "Senior Frontend Engineer",
    location: "Remote (EU)",
    url: "https://example.com/jobs/northwind-frontend",
    source: "Referral",
    salary: "£85k – £105k",
    status: "interviewing",
    notes: "Second round scheduled. Prepare the design-system migration story.",
    appliedAt: daysAgo(12),
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
  {
    id: "demo-app-2",
    company: "Bluepeak",
    role: "Platform Engineer",
    location: "Bengaluru, hybrid",
    url: "https://example.com/jobs/bluepeak-platform",
    source: "LinkedIn",
    salary: "₹38–46 LPA",
    status: "applied",
    notes: "Cover letter tailored to their CI pipeline rebuild.",
    appliedAt: daysAgo(5),
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },
  {
    id: "demo-app-3",
    company: "Meridian Health",
    role: "Full-Stack Engineer",
    location: "Remote",
    url: null,
    source: "Company site",
    salary: null,
    status: "offer",
    notes: "Verbal offer received. Negotiating the equity component.",
    appliedAt: daysAgo(30),
    createdAt: daysAgo(34),
    updatedAt: daysAgo(1),
  },
  {
    id: "demo-app-4",
    company: "Arclight",
    role: "Backend Engineer",
    location: "Remote (US)",
    url: null,
    source: "Job board",
    salary: "$130k – $160k",
    status: "rejected",
    notes: "Rejected after the system design round. Revisit consistency models.",
    appliedAt: daysAgo(40),
    createdAt: daysAgo(42),
    updatedAt: daysAgo(20),
  },
  {
    id: "demo-app-5",
    company: "Tessellate",
    role: "Product Engineer",
    location: "Remote",
    url: "https://example.com/jobs/tessellate",
    source: "Newsletter",
    salary: null,
    status: "saved",
    notes: "Closes at the end of the month.",
    appliedAt: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
];

/** Simulate network latency so demo loading states are actually visible. */
export const demoDelay = (ms = 450) =>
  new Promise((resolve) => setTimeout(resolve, ms));
