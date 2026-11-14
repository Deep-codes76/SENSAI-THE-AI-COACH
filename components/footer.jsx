import Link from "next/link";
import { Github } from "lucide-react";

import Logo from "@/components/logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/dashboard", label: "Industry Insights" },
      { href: "/resume", label: "Resume Builder" },
      { href: "/ai-cover-letter", label: "Cover Letters" },
      { href: "/interview", label: "Interview Prep" },
    ],
  },
  {
    title: "Built with",
    links: [
      { href: "https://nextjs.org", label: "Next.js 15" },
      { href: "https://www.prisma.io", label: "Prisma + Neon" },
      { href: "https://clerk.com", label: "Clerk" },
      { href: "https://ai.google.dev", label: "Google Gemini" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Deliberate practice for your job search — insights, resume, cover
              letters and mock interviews in one place.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="section-label">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="link-wipe text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="ink-rule my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            Designed and built by{" "}
            <span className="font-medium text-foreground">Deepanshu</span>
          </p>
          <Link
            href="https://github.com/Deep-codes76/SENSAI-THE-AI-COACH"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Source
          </Link>
        </div>
      </div>
    </footer>
  );
}
