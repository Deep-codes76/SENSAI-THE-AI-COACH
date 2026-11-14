function Shimmer({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-muted ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}

function CardShell({ children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">{children}</div>
  );
}

/**
 * Skeletons that mirror the real layout. The pages previously fell back to a
 * full-width bar loader, which caused a visible jump when content arrived.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardShell key={i}>
            <Shimmer className="h-3 w-24" />
            <Shimmer className="mt-4 h-8 w-20" />
            <Shimmer className="mt-3 h-2 w-full" />
          </CardShell>
        ))}
      </div>
      <CardShell>
        <Shimmer className="h-4 w-48" />
        <Shimmer className="mt-6 h-[320px] w-full" />
      </CardShell>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardShell key={i}>
            <Shimmer className="h-4 w-40" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <Shimmer key={j} className="h-3 w-full" />
              ))}
            </div>
          </CardShell>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <CardShell key={i}>
          <Shimmer className="h-5 w-64" />
          <Shimmer className="mt-3 h-3 w-40" />
          <Shimmer className="mt-5 h-3 w-full" />
        </CardShell>
      ))}
    </div>
  );
}

export function InterviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardShell key={i}>
            <Shimmer className="h-3 w-28" />
            <Shimmer className="mt-4 h-8 w-16" />
          </CardShell>
        ))}
      </div>
      <CardShell>
        <Shimmer className="h-5 w-44" />
        <Shimmer className="mt-6 h-[260px] w-full" />
      </CardShell>
      <ListSkeleton rows={2} />
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-10 w-64" />
      <Shimmer className="h-[600px] w-full" />
    </div>
  );
}
