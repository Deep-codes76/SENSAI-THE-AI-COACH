import { describe, expect, it } from "vitest";

import {
  entriesToMarkdown,
  formatDisplayDate,
  parseMarkdownToForm,
  toMonthInputValue,
} from "@/app/lib/helper";

describe("formatDisplayDate", () => {
  it("formats a month input value for display", () => {
    expect(formatDisplayDate("2024-01")).toBe("Jan 2024");
    expect(formatDisplayDate("2023-12")).toBe("Dec 2023");
  });

  it("passes through empty and already-formatted values", () => {
    expect(formatDisplayDate("")).toBe("");
    expect(formatDisplayDate(undefined)).toBe("");
    expect(formatDisplayDate("Jan 2024")).toBe("Jan 2024");
  });
});

describe("toMonthInputValue", () => {
  it("converts a display date back to a month input value", () => {
    expect(toMonthInputValue("Jan 2024")).toBe("2024-01");
    expect(toMonthInputValue("Dec 2023")).toBe("2023-12");
    expect(toMonthInputValue("September 2021")).toBe("2021-09");
  });

  it("is idempotent for values already in month format", () => {
    expect(toMonthInputValue("2024-07")).toBe("2024-07");
  });

  it("returns an empty string for unparseable input", () => {
    expect(toMonthInputValue("sometime last year")).toBe("");
    expect(toMonthInputValue("")).toBe("");
  });

  // This pairing is the bug that silently wiped every date on re-edit.
  it("round-trips with formatDisplayDate", () => {
    for (const value of ["2020-01", "2022-06", "2025-11"]) {
      expect(toMonthInputValue(formatDisplayDate(value))).toBe(value);
    }
  });
});

describe("entriesToMarkdown", () => {
  it("returns an empty string with no entries", () => {
    expect(entriesToMarkdown([], "Work Experience")).toBe("");
    expect(entriesToMarkdown(undefined, "Work Experience")).toBe("");
  });

  it("renders a current role as 'Present'", () => {
    const md = entriesToMarkdown(
      [
        {
          title: "Engineer",
          organization: "Acme",
          startDate: "2023-04",
          endDate: "",
          current: true,
          description: "Did the work.",
        },
      ],
      "Work Experience"
    );

    expect(md).toContain("## Work Experience");
    expect(md).toContain("### Engineer @ Acme");
    expect(md).toContain("Apr 2023 - Present");
  });
});

describe("parseMarkdownToForm", () => {
  const markdown = `## <div align="center">Ada Lovelace</div>

<div align="center">

📧 ada@example.com | 📱 +44 20 7946 0000 | 💼 [LinkedIn](https://linkedin.com/in/ada) | 🐦 [Twitter](https://x.com/ada)

</div>

## Professional Summary

Engineer with a focus on correctness.

## Skills

Analytical engines, mathematics

## Work Experience

### Analyst @ Analytical Engine Co
2022-01 - Present

Wrote the first algorithm.

### Assistant @ Somerville
2020-03 - 2021-12

Assisted with notation.

## Education

### BSc Mathematics @ University of London
2016-09 - 2020-06

Graduated with honours.

## Projects

### Note G @ Personal
2021-01 - 2021-06

The first published computer program.
`;

  it("returns null without input", () => {
    expect(parseMarkdownToForm("")).toBeNull();
    expect(parseMarkdownToForm(null)).toBeNull();
  });

  it("extracts contact information", () => {
    const form = parseMarkdownToForm(markdown);
    expect(form.contactInfo.email).toBe("ada@example.com");
    expect(form.contactInfo.linkedin).toBe("https://linkedin.com/in/ada");
    expect(form.contactInfo.twitter).toBe("https://x.com/ada");
    expect(form.contactInfo.mobile).toContain("+44");
  });

  it("extracts the text sections without bleeding into the next heading", () => {
    const form = parseMarkdownToForm(markdown);
    expect(form.summary).toBe("Engineer with a focus on correctness.");
    expect(form.skills).toBe("Analytical engines, mathematics");
    expect(form.summary).not.toContain("##");
  });

  it("parses every entry section", () => {
    const form = parseMarkdownToForm(markdown);
    expect(form.experience).toHaveLength(2);
    expect(form.education).toHaveLength(1);
    expect(form.projects).toHaveLength(1);
  });

  it("parses dates back into month-input format", () => {
    const [firstRole, secondRole] = parseMarkdownToForm(markdown).experience;

    expect(firstRole).toMatchObject({
      title: "Analyst",
      organization: "Analytical Engine Co",
      startDate: "2022-01",
      endDate: "",
      current: true,
    });

    expect(secondRole).toMatchObject({
      startDate: "2020-03",
      endDate: "2021-12",
      current: false,
    });
  });

  it("survives a full generate-then-parse round trip", () => {
    const entries = [
      {
        title: "Engineer",
        organization: "Acme",
        startDate: "2021-05",
        endDate: "2023-08",
        current: false,
        description: "Shipped things.",
      },
    ];

    const parsed = parseMarkdownToForm(
      entriesToMarkdown(entries, "Work Experience")
    );

    expect(parsed.experience[0]).toMatchObject(entries[0]);
  });
});
