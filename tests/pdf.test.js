import { describe, expect, it } from "vitest";

import { toSafeFilename } from "@/lib/pdf";

describe("toSafeFilename", () => {
  it("slugifies a title", () => {
    expect(toSafeFilename("Senior Frontend Engineer-Northwind Labs")).toBe(
      "senior-frontend-engineer-northwind-labs"
    );
  });

  it("strips characters that are illegal in filenames", () => {
    expect(toSafeFilename('C++ Dev: "Core"/Team?')).toBe("c++-dev-coreteam");
  });

  it("falls back when nothing usable is left", () => {
    expect(toSafeFilename("///", "cover-letter")).toBe("cover-letter");
    expect(toSafeFilename(undefined, "resume")).toBe("resume");
  });

  it("caps the length", () => {
    expect(toSafeFilename("a".repeat(200)).length).toBe(80);
  });
});
