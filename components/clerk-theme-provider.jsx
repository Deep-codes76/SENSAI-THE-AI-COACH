"use client";

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

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? darkTheme : undefined,
        variables: {
          colorPrimary: resolvedTheme === "dark" ? "#f06a42" : "#d1451f",
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
