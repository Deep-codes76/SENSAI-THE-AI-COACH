// Helper function to convert entries to markdown
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";

  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}

// Helper function to parse markdown content back to structured form entries
export function parseMarkdownToForm(markdown) {
  if (!markdown) return null;

  const contactInfo = {
    email: "",
    mobile: "",
    linkedin: "",
    twitter: "",
  };

  // Extract email
  const emailMatch = markdown.match(/📧\s*([^\s|#\n]+)/);
  if (emailMatch) contactInfo.email = emailMatch[1].trim();

  // Extract mobile
  const mobileMatch = markdown.match(/📱\s*([^\s|#\n]+(?:\s+[^\s|#\n]+)*)/);
  if (mobileMatch) contactInfo.mobile = mobileMatch[1].trim();

  // Extract LinkedIn
  const linkedinMatch = markdown.match(/💼\s*\[LinkedIn\]\(([^)]+)\)/);
  if (linkedinMatch) contactInfo.linkedin = linkedinMatch[1].trim();

  // Extract Twitter
  const twitterMatch = markdown.match(/🐦\s*\[Twitter\]\(([^)]+)\)/);
  if (twitterMatch) contactInfo.twitter = twitterMatch[1].trim();

  // Extract Summary
  const summaryMatch = markdown.match(/## Professional Summary\s*\n\n([\s\S]*?)(?=\n\n## |$)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";

  // Extract Skills
  const skillsMatch = markdown.match(/## Skills\s*\n\n([\s\S]*?)(?=\n\n## |$)/);
  const skills = skillsMatch ? skillsMatch[1].trim() : "";

  // Helper to parse entries (Experience, Education, Projects)
  const parseSection = (sectionName) => {
    const sectionRegex = new RegExp(
      `## ${sectionName}\\s*\\n\\n([\\s\\S]*?)(?=\\n\\n## |$)`
    );
    const match = markdown.match(sectionRegex);
    if (!match) return [];

    const sectionContent = match[1].trim();
    if (!sectionContent) return [];

    // Split by "### " using regex that matches at the start of a line
    const parts = sectionContent.split(/^###\s+/m);
    const entries = [];

    for (const part of parts) {
      if (!part.trim()) continue;

      const lines = part.split("\n");
      const headerLine = lines[0].trim();
      
      let title = headerLine;
      let organization = "";
      if (headerLine.includes(" @ ")) {
        const headerParts = headerLine.split(" @ ");
        title = headerParts[0].trim();
        organization = headerParts.slice(1).join(" @ ").trim();
      }

      const dateLine = lines[1] ? lines[1].trim() : "";
      let startDate = "";
      let endDate = "";
      let current = false;

      let descriptionLinesStartIdx = 2;
      
      if (dateLine && (dateLine.includes(" - ") || dateLine.toLowerCase().includes("present"))) {
        const dateParts = dateLine.split(/\s*-\s*/);
        startDate = dateParts[0] ? dateParts[0].trim() : "";
        const endPart = dateParts[1] ? dateParts[1].trim() : "";
        if (endPart.toLowerCase() === "present") {
          current = true;
          endDate = "";
        } else {
          endDate = endPart;
        }
      } else {
        descriptionLinesStartIdx = 1;
      }

      const description = lines.slice(descriptionLinesStartIdx).join("\n").trim();

      entries.push({
        title,
        organization,
        startDate,
        endDate,
        current,
        description,
      });
    }

    return entries;
  };

  const experience = parseSection("Work Experience");
  const education = parseSection("Education");
  const projects = parseSection("Projects");

  return {
    contactInfo,
    summary,
    skills,
    experience,
    education,
    projects,
  };
}

