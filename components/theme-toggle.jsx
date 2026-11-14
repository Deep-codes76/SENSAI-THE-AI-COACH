"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /*
   * The server cannot know which theme the browser resolved to, so *every*
   * themed attribute has to wait for mount — not just the icon.
   *
   * Guarding only the icon still produced a hydration mismatch, because the
   * server rendered aria-label="Switch to dark theme" (resolvedTheme is
   * undefined there) while the client rendered "Switch to light theme".
   */
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      // Neutral until the theme is known, so server and client agree.
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}

export default ThemeToggle;
