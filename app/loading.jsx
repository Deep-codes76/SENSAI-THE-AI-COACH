export default function Loading() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
