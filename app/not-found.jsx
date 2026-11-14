import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="numeric text-7xl font-semibold text-primary/30 md:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-4xl md:text-5xl">Nothing here.</h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        The page you are looking for does not exist, or it has moved.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
