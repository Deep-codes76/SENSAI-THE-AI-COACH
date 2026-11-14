import { describe, expect, it } from "vitest";

import {
  contactSchema,
  coverLetterSchema,
  entrySchema,
  onboardingSchema,
} from "@/app/lib/schema";

const baseEntry = {
  title: "Engineer",
  organization: "Acme",
  startDate: "2022-01",
  endDate: "2023-01",
  description: "Did the work.",
  current: false,
};

describe("onboardingSchema", () => {
  it("coerces experience from the string an input gives us", () => {
    const parsed = onboardingSchema.parse({
      industry: "tech",
      subIndustry: "Software Development",
      experience: "4",
      skills: "React, Node",
    });

    expect(parsed.experience).toBe(4);
    expect(parsed.skills).toEqual(["React", "Node"]);
  });

  it("defaults skills to an empty array", () => {
    const parsed = onboardingSchema.parse({
      industry: "tech",
      subIndustry: "Software Development",
      experience: "0",
    });

    expect(parsed.skills).toEqual([]);
  });

  it("reports a readable message for a blank experience field", () => {
    const result = onboardingSchema.safeParse({
      industry: "tech",
      subIndustry: "Software Development",
      experience: "",
    });

    expect(result.success).toBe(false);
    // Previously surfaced as "Expected number, received nan".
    expect(JSON.stringify(result.error.issues)).toMatch(/required/i);
  });

  it("rejects out-of-range experience", () => {
    for (const experience of ["-1", "51"]) {
      expect(
        onboardingSchema.safeParse({
          industry: "tech",
          subIndustry: "Software Development",
          experience,
        }).success
      ).toBe(false);
    }
  });
});

describe("contactSchema", () => {
  it("treats empty optional URLs as absent", () => {
    const parsed = contactSchema.parse({
      email: "a@b.com",
      linkedin: "",
      twitter: "",
    });

    expect(parsed.linkedin).toBeUndefined();
    expect(parsed.twitter).toBeUndefined();
  });

  it("rejects a malformed URL", () => {
    expect(
      contactSchema.safeParse({ email: "a@b.com", linkedin: "linkedin.com/in/x" })
        .success
    ).toBe(false);
  });

  it("requires a valid email", () => {
    expect(contactSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("entrySchema", () => {
  it("accepts a completed entry", () => {
    expect(entrySchema.safeParse(baseEntry).success).toBe(true);
  });

  it("allows a missing end date only for a current position", () => {
    expect(
      entrySchema.safeParse({ ...baseEntry, endDate: "", current: false }).success
    ).toBe(false);

    expect(
      entrySchema.safeParse({ ...baseEntry, endDate: "", current: true }).success
    ).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const result = entrySchema.safeParse({
      ...baseEntry,
      startDate: "2023-05",
      endDate: "2022-01",
    });

    expect(result.success).toBe(false);
  });
});

describe("coverLetterSchema", () => {
  it("requires a substantive job description", () => {
    expect(
      coverLetterSchema.safeParse({
        companyName: "Acme",
        jobTitle: "Engineer",
        jobDescription: "too short",
      }).success
    ).toBe(false);
  });

  it("accepts a full posting", () => {
    expect(
      coverLetterSchema.safeParse({
        companyName: "Acme",
        jobTitle: "Engineer",
        jobDescription: "x".repeat(80),
      }).success
    ).toBe(true);
  });
});
