/**
 * Resolve the canonical public URL of this deployment.
 *
 * Used for `metadataBase`, which is what makes Open Graph and Twitter image
 * paths absolute. Most hosts already publish their own URL, so asking the
 * operator to type it in is both redundant and easy to get wrong — you do not
 * know the value until after the first deploy.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL  — explicit, and required for a custom domain
 *   2. RENDER_EXTERNAL_URL   — set by Render on web services, includes scheme
 *   3. VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL — bare host, needs a scheme
 *   4. localhost
 */
const FALLBACK = "http://localhost:3000";

/** Accepts a bare host or a full URL and always returns a full origin. */
export function normaliseSiteUrl(value) {
  if (!value || typeof value !== "string") return null;

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);

    // `new URL` is lenient: given "ht!tp://%%%" it prepends a scheme and then
    // happily parses "ht!tp" as the host, yielding a nonsense but
    // structurally valid origin. Check the hostname actually looks like one.
    const host = url.hostname;
    const looksLikeHost =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(
        host
      ) && (host.includes(".") || host === "localhost");

    return looksLikeHost ? url.origin : null;
  } catch {
    // A malformed value must not take the build down; fall through instead.
    return null;
  }
}

export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const resolved = normaliseSiteUrl(candidate);
    if (resolved) return resolved;
  }

  return FALLBACK;
}
