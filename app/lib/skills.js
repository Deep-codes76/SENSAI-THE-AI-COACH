/** Loose match, so "Node.js" and "nodejs" are not counted as different skills. */
export const normaliseSkill = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

/**
 * Compare a user's skills against what their market is asking for.
 *
 * Extracted from the dashboard component so the matching rules can be tested
 * directly — near-miss spellings are exactly where this kind of comparison
 * quietly goes wrong.
 */
export function computeSkillGap({ marketSkills = [], userSkills = [] } = {}) {
  const unique = [];
  const seen = new Set();

  for (const skill of marketSkills) {
    const key = normaliseSkill(skill);
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(skill);
    }
  }

  const mine = new Set(userSkills.map(normaliseSkill).filter(Boolean));
  const have = unique.filter((s) => mine.has(normaliseSkill(s)));
  const missing = unique.filter((s) => !mine.has(normaliseSkill(s)));

  return {
    total: unique.length,
    have,
    missing,
    coverage: unique.length
      ? Math.round((have.length / unique.length) * 100)
      : 0,
  };
}
