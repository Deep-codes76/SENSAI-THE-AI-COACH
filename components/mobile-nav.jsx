"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  PenBox,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Items live here rather than being passed in: icons are React components,
 * and a server component cannot hand a function across the client boundary.
 */
const items = [
  {
    href: "/dashboard",
    label: "Industry Insights",
    description: "Salary, demand and trends",
    Icon: LayoutDashboard,
  },
  {
    href: "/resume",
    label: "Resume Builder",
    description: "Draft and ATS-score your resume",
    Icon: FileText,
  },
  {
    href: "/ai-cover-letter",
    label: "Cover Letters",
    description: "Tailored to a specific posting",
    Icon: PenBox,
  },
  {
    href: "/interview",
    label: "Interview Prep",
    description: "Mock interviews and score history",
    Icon: GraduationCap,
  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation, otherwise the panel stays over the new page.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {open && (
        <div
          className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/98 backdrop-blur-xl"
          role="dialog"
          aria-label="Navigation"
        >
          <div className="container flex flex-col gap-1 py-4">
            {items.map(({ href, label, description, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors hover:bg-muted"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
