
import { dark } from "@clerk/themes";
import { Fraunces, Figtree, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import ClerkThemeProvider from "@/components/clerk-theme-provider";
import { DEMO_MODE } from "@/lib/demo";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sensai — Your AI Career Coach",
    template: "%s · Sensai",
  },
  description:
    "Sensai turns job hunting into deliberate practice: live industry insights, an ATS-scored resume builder, tailored cover letters and endless mock interviews.",
  keywords: [
    "AI career coach",
    "resume builder",
    "ATS score",
    "mock interview",
    "cover letter generator",
  ],
  openGraph: {
    title: "Sensai — Your AI Career Coach",
    description:
      "Industry insights, an ATS-scored resume builder, tailored cover letters and AI mock interviews.",
    url: siteUrl,
    siteName: "Sensai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sensai — Your AI Career Coach",
    description:
      "Industry insights, an ATS-scored resume builder, tailored cover letters and AI mock interviews.",
  },
  icons: { icon: "/logo.png" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export default function RootLayout({ children }) {
  const shell = (
    <>
      <div className="rule-grid" aria-hidden="true" />
      <Header />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <Toaster richColors position="top-center" closeButton />
    </>
  );

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="grain min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/*
            Clerk's appearance was hard-pinned to its dark theme, so every
            auth surface stayed black in light mode. This syncs it instead,
            and demo mode skips the provider entirely.
          */}
          {DEMO_MODE ? (
            shell
          ) : (
            <ClerkThemeProvider darkTheme={dark}>{shell}</ClerkThemeProvider>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
