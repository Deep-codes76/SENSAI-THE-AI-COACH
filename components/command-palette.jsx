"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Briefcase,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Moon,
  PenBox,
  Play,
  Plus,
  Search,
  Sun,
  UserCog,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

const navigation = [
  { label: "Industry Insights", href: "/dashboard", Icon: LayoutDashboard, keywords: "market salary demand trends" },
  { label: "Applications", href: "/applications", Icon: Briefcase, keywords: "pipeline jobs tracker status" },
  { label: "Resume Builder", href: "/resume", Icon: FileText, keywords: "cv ats score pdf" },
  { label: "Cover Letters", href: "/ai-cover-letter", Icon: PenBox, keywords: "letter application write" },
  { label: "Interview Prep", href: "/interview", Icon: GraduationCap, keywords: "quiz practice score" },
];

const actions = [
  { label: "Start a mock interview", href: "/interview/mock", Icon: Play, keywords: "quiz new practice" },
  { label: "Write a new cover letter", href: "/ai-cover-letter/new", Icon: Plus, keywords: "create generate" },
  { label: "Edit your profile", href: "/onboarding", Icon: UserCog, keywords: "industry skills experience onboarding" },
];

/**
 * ⌘K / Ctrl-K palette.
 *
 * The app has five surfaces behind a dropdown; this makes any of them one
 * keystroke away, and gives the header a visible affordance for people who
 * would never guess the shortcut.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Listen for the header button, so the trigger does not have to be a
  // sibling of this component in the tree.
  useEffect(() => {
    const openPalette = () => setOpen(true);
    window.addEventListener("sensai:open-command-palette", openPalette);
    return () =>
      window.removeEventListener("sensai:open-command-palette", openPalette);
  }, []);

  const run = useCallback((fn) => {
    setOpen(false);
    fn();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search Sensai">
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>Nothing matched that.</CommandEmpty>

        <CommandGroup heading="Go to">
          {navigation.map(({ label, href, Icon, keywords }) => (
            <CommandItem
              key={href}
              value={`${label} ${keywords}`}
              onSelect={() => run(() => router.push(href))}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {actions.map(({ label, href, Icon, keywords }) => (
            <CommandItem
              key={href}
              value={`${label} ${keywords}`}
              onSelect={() => run(() => router.push(href))}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Preferences">
          <CommandItem
            value="toggle theme dark light appearance"
            onSelect={() =>
              run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
            Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** Header affordance; dispatches the event the palette listens for. */
export function CommandPaletteTrigger() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/mac/i.test(navigator.platform || navigator.userAgent));
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event("sensai:open-command-palette"))
      }
      className="hidden items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted lg:inline-flex"
      aria-label="Open the command menu"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Search</span>
      <CommandShortcut className="ml-1">
        {isMac ? "⌘" : "Ctrl "}K
      </CommandShortcut>
    </button>
  );
}
