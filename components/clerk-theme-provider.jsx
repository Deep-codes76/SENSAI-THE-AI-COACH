"use client";

import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";

/**
 * Keep Clerk's hosted components on the same theme as the rest of the app.
 *
 * `ClerkProvider` previously sat in the server layout with `baseTheme: dark`
 * hard-coded, which left the sign-in card black on a paper background
 * whenever the user chose the light theme.
 */
export default function ClerkThemeProvider({ children, darkTheme }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // `resolvedTheme` is undefined on the server, so reading it during the first
  // render makes the server and client disagree about Clerk's appearance.
  // The theme is applied once mounted instead; both sides start neutral.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? darkTheme : undefined,
        variables: {
          colorPrimary: isDark ? "#f06a42" : "#d1451f",
          borderRadius: "0.625rem",
        },
        elements: {
          card: "shadow-xl border border-border",
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
