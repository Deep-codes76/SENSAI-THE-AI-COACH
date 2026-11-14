const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * `"2024-01"` (the value of `<input type="month">`) -> `"Jan 2024"`.
 * Anything already human-readable, or empty, is passed through untouched.
 */
export function formatDisplayDate(value) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;

  const [, year, month] = match;
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : value;
}

/**
 * `"Jan 2024"` -> `"2024-01"`.
 *
 * This is the inverse the original code was missing. Entries were written to
 * markdown as "Jan 2024" and read straight back into `<input type="month">`,
 * which only accepts `yyyy-MM` — so every date silently blanked out the first
 * time a saved resume was reopened, and the entry then failed validation.
 */
export function toMonthInputValue(value) {
  if (!value) return "";
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;

  const match = /^([A-Za-z]{3,})\.?\s+(\d{4})$/.exec(trimmed);
  if (!match) return "";

  const [, monthName, year] = match;
  const index = MONTHS.findIndex(
    (m) => m.toLowerCase() === monthName.slice(0, 3).toLowerCase()
  );
  if (index === -1) return "";

  return `${year}-${String(index + 1).padStart(2, "0")}`;
}

/** Render a list of resume entries as a markdown section. */
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const start = formatDisplayDate(entry.startDate);
        const dateRange = entry.current
          ? `${start} - Present`
          : `${start} - ${formatDisplayDate(entry.endDate)}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}

const SECTION_END = "(?=\\n\\s*##\\s|$)";

function matchSection(markdown, heading) {
  const regex = new RegExp(
    `##\\s+${heading}\\s*\\n+([\\s\\S]*?)${SECTION_END}`,
    "i"
  );
  const match = markdown.match(regex);
  return match ? match[1].trim() : "";
}

function parseEntrySection(markdown, heading) {
  const content = matchSection(markdown, heading);
  if (!content) return [];

  return content
    .split(/^###\s+/m)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const lines = part.split("\n");
      const header = lines[0].trim();

      let title = header;
      let organization = "";
      if (header.includes(" @ ")) {
        const [first, ...rest] = header.split(" @ ");
        title = first.trim();
        organization = rest.join(" @ ").trim();
      }

      const dateLine = (lines[1] ?? "").trim();
      let startDate = "";
      let endDate = "";
      let current = false;
      let descriptionStart = 2;

      const isDateLine =
        /\s-\s/.test(dateLine) || /present/i.test(dateLine);

      if (isDateLine) {
        const [rawStart = "", rawEnd = ""] = dateLine.split(/\s+-\s+/);
        startDate = toMonthInputValue(rawStart);
        if (/^present$/i.test(rawEnd.trim())) {
          current = true;
        } else {
          endDate = toMonthInputValue(rawEnd);
        }
      } else {
        descriptionStart = 1;
      }

      return {
        title,
        organization,
        startDate,
        endDate,
        current,
        description: lines.slice(descriptionStart).join("\n").trim(),
      };
    });
}

/** Parse a saved resume back into the shape the builder form expects. */
export function parseMarkdownToForm(markdown) {
  if (!markdown) return null;

  const contactInfo = { email: "", mobile: "", linkedin: "", twitter: "" };

  const email = markdown.match(/📧\s*([^\s|#\n]+)/);
  if (email) contactInfo.email = email[1].trim();

  const mobile = markdown.match(/📱\s*([^|#\n]+)/);
  if (mobile) contactInfo.mobile = mobile[1].trim();

  const linkedin = markdown.match(/💼\s*\[LinkedIn\]\(([^)]+)\)/);
  if (linkedin) contactInfo.linkedin = linkedin[1].trim();

  const twitter = markdown.match(/🐦\s*\[Twitter\]\(([^)]+)\)/);
  if (twitter) contactInfo.twitter = twitter[1].trim();

  return {
    contactInfo,
    summary: matchSection(markdown, "Professional Summary"),
    skills: matchSection(markdown, "Skills"),
    experience: parseEntrySection(markdown, "Work Experience"),
    education: parseEntrySection(markdown, "Education"),
    projects: parseEntrySection(markdown, "Projects"),
  };
}
