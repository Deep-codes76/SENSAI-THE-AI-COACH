import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getSiteUrl, normaliseSiteUrl } from "@/lib/site-url";

const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "RENDER_EXTERNAL_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
];

let saved;

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
});

afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("normaliseSiteUrl", () => {
  it("keeps a full URL, dropping any trailing slash", () => {
    expect(normaliseSiteUrl("https://sensai.onrender.com/")).toBe(
      "https://sensai.onrender.com"
    );
  });

  it("adds https to a bare host, which is what Vercel provides", () => {
    expect(normaliseSiteUrl("sensai.vercel.app")).toBe("https://sensai.vercel.app");
  });

  it("preserves an explicit http origin for local development", () => {
    expect(normaliseSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("returns null rather than throwing on junk", () => {
    // metadataBase does `new URL(...)` at module scope: a throw here would
    // take down the entire build.
    expect(normaliseSiteUrl("")).toBeNull();
    expect(normaliseSiteUrl("   ")).toBeNull();
    expect(normaliseSiteUrl(undefined)).toBeNull();
    expect(normaliseSiteUrl("ht!tp://%%%")).toBeNull();
  });
});

describe("getSiteUrl", () => {
  it("falls back to localhost when nothing is set", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("uses RENDER_EXTERNAL_URL when Render provides it", () => {
    process.env.RENDER_EXTERNAL_URL = "https://sensai.onrender.com";
    expect(getSiteUrl()).toBe("https://sensai.onrender.com");
  });

  it("prefers an explicit NEXT_PUBLIC_SITE_URL over the host's own value", () => {
    process.env.RENDER_EXTERNAL_URL = "https://sensai.onrender.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://sensai.dev";
    expect(getSiteUrl()).toBe("https://sensai.dev");
  });

  it("uses the Vercel host and gives it a scheme", () => {
    process.env.VERCEL_URL = "sensai-abc123.vercel.app";
    expect(getSiteUrl()).toBe("https://sensai-abc123.vercel.app");
  });

  it("skips an empty or malformed value instead of using it", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    process.env.RENDER_EXTERNAL_URL = "https://sensai.onrender.com";
    expect(getSiteUrl()).toBe("https://sensai.onrender.com");
  });
});
