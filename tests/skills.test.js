import { describe, expect, it } from "vitest";

import { computeSkillGap, normaliseSkill } from "@/app/lib/skills";

describe("normaliseSkill", () => {
  it("ignores punctuation, spacing and case", () => {
    expect(normaliseSkill("Node.js")).toBe(normaliseSkill("nodejs"));
    expect(normaliseSkill("System Design")).toBe(normaliseSkill("system-design"));
    expect(normaliseSkill("  React  ")).toBe("react");
  });

  it("keeps characters that distinguish real skills", () => {
    expect(normaliseSkill("C++")).toBe("c++");
    expect(normaliseSkill("C#")).toBe("c#");
    expect(normaliseSkill("C++")).not.toBe(normaliseSkill("C#"));
  });

  it("handles empty input", () => {
    expect(normaliseSkill(null)).toBe("");
    expect(normaliseSkill(undefined)).toBe("");
  });
});

describe("computeSkillGap", () => {
  it("splits market skills into held and missing", () => {
    const result = computeSkillGap({
      marketSkills: ["React", "Kubernetes", "Go"],
      userSkills: ["React"],
    });

    expect(result.have).toEqual(["React"]);
    expect(result.missing).toEqual(["Kubernetes", "Go"]);
    expect(result.total).toBe(3);
    expect(result.coverage).toBe(33);
  });

  it("matches across spelling differences", () => {
    const result = computeSkillGap({
      marketSkills: ["Node.js", "System Design"],
      userSkills: ["nodejs", "system-design"],
    });

    expect(result.missing).toEqual([]);
    expect(result.coverage).toBe(100);
  });

  it("de-duplicates the market list, keeping the first spelling", () => {
    const result = computeSkillGap({
      marketSkills: ["TypeScript", "typescript", "Type Script"],
      userSkills: [],
    });

    expect(result.total).toBe(1);
    expect(result.missing).toEqual(["TypeScript"]);
  });

  it("returns zero coverage rather than dividing by zero", () => {
    expect(computeSkillGap({ marketSkills: [], userSkills: ["React"] })).toMatchObject({
      total: 0,
      coverage: 0,
    });
    expect(computeSkillGap()).toMatchObject({ total: 0, coverage: 0 });
  });

  it("ignores blank entries on either side", () => {
    const result = computeSkillGap({
      marketSkills: ["React", "", "   "],
      userSkills: ["", "React"],
    });

    expect(result.total).toBe(1);
    expect(result.coverage).toBe(100);
  });
});
