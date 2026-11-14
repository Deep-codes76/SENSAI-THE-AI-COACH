import { describe, expect, it, vi } from "vitest";

import { parseJsonResponse, withRetry } from "@/lib/ai";

describe("parseJsonResponse", () => {
  it("parses plain JSON", () => {
    expect(parseJsonResponse('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses JSON wrapped in a markdown fence", () => {
    expect(parseJsonResponse('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJsonResponse('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("recovers JSON surrounded by prose", () => {
    expect(
      parseJsonResponse('Sure, here you go:\n{"a":1}\nHope that helps!')
    ).toEqual({ a: 1 });
  });

  it("parses a top-level array", () => {
    expect(parseJsonResponse("Here: [1,2,3]")).toEqual([1, 2, 3]);
  });

  it("throws a readable error on empty input", () => {
    expect(() => parseJsonResponse("")).toThrow(/empty/i);
    expect(() => parseJsonResponse(null)).toThrow(/empty/i);
  });

  it("throws a readable error on unparseable input", () => {
    expect(() => parseJsonResponse("not json at all")).toThrow(/could not be parsed/i);
  });
});

describe("withRetry", () => {
  it("returns the first successful result", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(withRetry(fn)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries transient failures and then succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("503 service unavailable"))
      .mockResolvedValue("ok");

    await expect(withRetry(fn, { baseDelayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry a non-transient failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("401 invalid api key"));

    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow(/401/);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after the retry budget", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("429 rate limited"));

    await expect(
      withRetry(fn, { retries: 2, baseDelayMs: 1 })
    ).rejects.toThrow(/429/);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
