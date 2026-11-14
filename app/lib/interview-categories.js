/**
 * Quiz categories.
 *
 * Kept out of actions/interview.js because every export from a "use server"
 * module must be an async function; a plain object there fails the build.
 *
 * The Assessment model has always had a `category` column, but every row was
 * written as "Technical" because the quiz only generated one kind of question.
 */
export const QUIZ_CATEGORIES = {
  technical: {
    label: "Technical",
    description: "Language, framework and tooling depth",
    instruction:
      "Focus on concrete technical knowledge: language semantics, framework behaviour, debugging and tooling.",
  },
  system_design: {
    label: "System Design",
    description: "Architecture, trade-offs and scale",
    instruction:
      "Focus on architecture and trade-offs: data modelling, caching, consistency, queues, failure modes and scaling decisions.",
  },
  behavioural: {
    label: "Behavioural",
    description: "Collaboration, ownership and conflict",
    instruction:
      "Focus on workplace judgement: collaboration, ownership, disagreement, prioritisation and communication. Each option should be a plausible course of action, and the correct one the most professionally sound.",
  },
};

export const CATEGORY_KEYS = Object.keys(QUIZ_CATEGORIES);

const VALID = new Set(CATEGORY_KEYS);

/**
 * A plain `QUIZ_CATEGORIES[key]` truthiness check accepted inherited keys:
 * "constructor" resolved to Object's constructor, so `category.label` came
 * back undefined and that was written to the database as the quiz category.
 */
export const resolveCategory = (key) => (VALID.has(key) ? key : "technical");

/** Always returns a real category object. */
export const getCategory = (key) => QUIZ_CATEGORIES[resolveCategory(key)];
