export function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* The hanko seal: a rotated square with a brush stroke through it. */}
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rotate-45 rounded-[0.3rem] border border-primary/70" />
        <span className="absolute inset-[0.45rem] rotate-45 rounded-[0.15rem] bg-primary" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Sensai
      </span>
    </span>
  );
}

export default Logo;
