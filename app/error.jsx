"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Without one, any thrown server action or render
 * error replaced the whole page with Next's default stack-trace screen.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="section-label">Something broke</p>
      <h1 className="mt-4 text-4xl md:text-5xl">That didn&apos;t work.</h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        {error?.message ||
          "An unexpected error occurred. Trying again often resolves it."}
      </p>

      {error?.digest && (
        <p className="numeric mt-3 text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
