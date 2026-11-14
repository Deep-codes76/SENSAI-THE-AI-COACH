import { describe, expect, it } from "vitest";

import { generateAIInsights } from "@/actions/dashboard";
import { generateJson, generateText } from "@/lib/ai";

/**
 * Live Gemini checks.
 *
 * Skipped unless GEMINI_API_KEY is present, so `npm test` stays hermetic and
 * CI needs no secrets. Run explicitly with:
 *
 *   npm run test:integration
 *
 * These exist because the unit tests mock the model away, and the failure
 * mode that actually bites in production is a retired model id or a schema
 * drift in the response — neither of which a mock can catch.
 */
const live = process.env.GEMINI_API_KEY ? describe : describe.skip;

live("Gemini (live)", () => {
  it(
    "generates free-form text",
    async () => {
      const text = await generateText("Reply with exactly: PONG");
      expect(text.toUpperCase()).toContain("PONG");
    },
    120_000
  );

  it(
    "generates parseable JSON",
    async () => {
      const json = await generateJson('Return ONLY {"ok":true,"n":42}');
      expect(json).toMatchObject({ ok: true, n: 42 });
    },
    120_000
  );

  it(
    "produces industry insights that satisfy the schema",
    async () => {
      const insights = await generateAIInsights("tech-software-development");

      expect(insights.salaryRanges.length).toBeGreaterThanOrEqual(1);
      expect(insights.salaryRanges[0]).toMatchObject({
        role: expect.any(String),
        min: expect.any(Number),
        max: expect.any(Number),
        median: expect.any(Number),
      });

      expect(["High", "Medium", "Low"]).toContain(insights.demandLevel);
      expect(["Positive", "Neutral", "Negative"]).toContain(
        insights.marketOutlook
      );
      expect(insights.growthRate).toBeGreaterThanOrEqual(-100);
      expect(insights.growthRate).toBeLessThanOrEqual(100);
      expect(insights.topSkills.length).toBeGreaterThanOrEqual(1);
      expect(insights.keyTrends.length).toBeGreaterThanOrEqual(1);
      expect(insights.recommendedSkills.length).toBeGreaterThanOrEqual(1);
    },
    180_000
  );
});
