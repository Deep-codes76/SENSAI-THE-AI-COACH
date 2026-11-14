import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Centralised Gemini access.
 *
 * Everything AI-related funnels through here so that model selection, JSON
 * parsing, retries and error semantics are defined in exactly one place.
 */

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

let client = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to your environment to enable AI features."
    );
  }
  if (!client) client = new GoogleGenerativeAI(apiKey);
  return client;
}

export function getModel({ json = false, model = DEFAULT_MODEL } = {}) {
  return getClient().getGenerativeModel({
    model,
    ...(json
      ? { generationConfig: { responseMimeType: "application/json" } }
      : {}),
  });
}

/**
 * Extract a JSON value from a model response.
 *
 * Even with `responseMimeType: "application/json"` the model occasionally wraps
 * output in a markdown fence or prepends prose, so we degrade gracefully
 * instead of throwing a raw SyntaxError at the user.
 */
export function parseJsonResponse(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("The AI returned an empty response.");
  }

  const candidates = [];
  candidates.push(text);

  const unfenced = text
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();
  candidates.push(unfenced);

  // Fall back to the outermost {...} or [...] span.
  for (const [open, close] of [
    ["{", "}"],
    ["[", "]"],
  ]) {
    const first = unfenced.indexOf(open);
    const last = unfenced.lastIndexOf(close);
    if (first !== -1 && last > first) {
      candidates.push(unfenced.slice(first, last + 1));
    }
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }

  throw new Error("The AI returned a response that could not be parsed.");
}

const RETRYABLE = /(429|500|502|503|504|overload|unavailable|timeout|fetch failed)/i;

/**
 * Run a Gemini call with bounded exponential backoff.
 *
 * Only transient failures are retried; a bad API key or a malformed prompt
 * fails immediately rather than burning three round trips.
 */
export async function withRetry(fn, { retries = 2, baseDelayMs = 600 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = String(error?.message ?? error);
      if (attempt === retries || !RETRYABLE.test(message)) break;
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}

/** Generate free-form text. */
export async function generateText(prompt, options) {
  const model = getModel(options);
  const result = await withRetry(() => model.generateContent(prompt));
  return result.response.text().trim();
}

/** Generate and parse a JSON payload. */
export async function generateJson(prompt, options) {
  const model = getModel({ ...options, json: true });
  const result = await withRetry(() => model.generateContent(prompt));
  return parseJsonResponse(result.response.text());
}
