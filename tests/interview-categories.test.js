import { describe, expect, it } from "vitest";

import {
  CATEGORY_KEYS,
  QUIZ_CATEGORIES,
  resolveCategory,
} from "@/app/lib/interview-categories";

describe("interview categories", () => {
  it("exposes three rounds, each fully described", () => {
    expect(CATEGORY_KEYS).toEqual(["technical", "system_design", "behavioural"]);

    for (const key of CATEGORY_KEYS) {
      expect(QUIZ_CATEGORIES[key].label).toBeTruthy();
      expect(QUIZ_CATEGORIES[key].description).toBeTruthy();
      expect(QUIZ_CATEGORIES[key].instruction.length).toBeGreaterThan(20);
    }
  });

  it("falls back to technical for an unknown or missing key", () => {
    expect(resolveCategory("system_design")).toBe("system_design");
    expect(resolveCategory("nonsense")).toBe("technical");
    expect(resolveCategory(undefined)).toBe("technical");
    // Guards against prototype keys resolving as valid categories.
    expect(resolveCategory("constructor")).toBe("technical");
  });
});
