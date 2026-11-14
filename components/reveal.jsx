/**
 * Entrance animation wrapper.
 *
 * Purely presentational — the animation itself is a CSS scroll timeline (see
 * `.reveal-on-scroll` in globals.css), so this stays a server component and
 * ships no JavaScript.
 */
export default function Reveal({ children, className = "", delay = 0 }) {
  return (
    <div
      className={`reveal-on-scroll ${className}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
