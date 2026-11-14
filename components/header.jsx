import Link from "next/link";
import {
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/logo";
import MobileNav from "@/components/mobile-nav";
import ThemeToggle from "@/components/theme-toggle";
import AuthControls from "@/components/auth-controls";
import { checkUser } from "@/lib/checkUser";
import { DEMO_MODE } from "@/lib/demo";

export const growthTools = [
  {
    href: "/resume",
    label: "Resume Builder",
    description: "Draft and ATS-score your resume",
    icon: FileText,
  },
  {
    href: "/ai-cover-letter",
    label: "Cover Letters",
    description: "Tailored to a specific posting",
    icon: PenBox,
  },
  {
    href: "/interview",
    label: "Interview Prep",
    description: "Mock interviews and score history",
    icon: GraduationCap,
  },
];

function SignedInNav() {
  return (
    <>
      <Button
        asChild
        variant="ghost"
        className="hidden items-center gap-2 md:inline-flex"
      >
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Insights
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="hidden items-center gap-2 md:inline-flex">
            <Sparkles className="h-4 w-4" />
            Growth Tools
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="section-label">Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {growthTools.map((tool) => (
            <DropdownMenuItem key={tool.href} asChild>
              <Link href={tool.href} className="flex items-start gap-3 py-2.5">
                <tool.icon className="mt-0.5 h-4 w-4 text-primary" />
                <span className="flex flex-col">
                  <span className="font-medium">{tool.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {tool.description}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
      <nav className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Sensai home">
            <Logo />
          </Link>
          {DEMO_MODE && (
            <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-primary sm:inline-block">
              Demo
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {DEMO_MODE ? (
            <>
              <SignedInNav />
              <ThemeToggle />
              <MobileNav />
            </>
          ) : (
            <AuthControls signedInNav={<SignedInNav />}>
              <ThemeToggle />
            </AuthControls>
          )}
        </div>
      </nav>
    </header>
  );
}
