"use server";

import { z } from "zod";

import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateJson } from "@/lib/ai";
import { DEMO_MODE, demoDelay, demoInsights } from "@/lib/demo";

const insightsSchema = z.object({
  salaryRanges: z
    .array(
      z.object({
        role: z.string(),
        min: z.number(),
        max: z.number(),
        median: z.number(),
        location: z.string().optional().default("Global"),
      })
    )
    .min(1),
  growthRate: z.number(),
  demandLevel: z.string(),
  topSkills: z.array(z.string()).min(1),
  marketOutlook: z.string(),
  keyTrends: z.array(z.string()).min(1),
  recommendedSkills: z.array(z.string()).min(1),
});

/**
 * The model is told to use title case, but it is a language model, so the
 * values that drive UI colour coding are normalised before they are stored.
 */
const normaliseEnum = (value, allowed, fallback) => {
  const match = allowed.find(
    (option) => option.toLowerCase() === String(value).trim().toLowerCase()
  );
  return match ?? fallback;
};

const buildPrompt = (industry) => `
Analyze the current state of the ${industry} industry and return ONLY JSON in this shape:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

Rules:
- Return ONLY the JSON object. No prose, no markdown fences.
- Include at least 5 common roles in salaryRanges.
- Salary figures are annual, in USD, as plain numbers (e.g. 120000 not "120k").
- growthRate is a percentage expressed as a number between -100 and 100.
- Include at least 5 entries in topSkills, keyTrends and recommendedSkills.
`;

export const generateAIInsights = async (industry) => {
  if (!industry) throw new Error("An industry is required to generate insights");

  const raw = await generateJson(buildPrompt(industry));
  const parsed = insightsSchema.safeParse(raw);

  if (!parsed.success) {
    console.error("Invalid insight payload:", parsed.error.flatten());
    throw new Error("The AI returned industry data in an unexpected format.");
  }

  const insights = parsed.data;

  return {
    ...insights,
    // Clamp to the range the dashboard progress bar can actually render.
    growthRate: Math.max(-100, Math.min(100, insights.growthRate)),
    demandLevel: normaliseEnum(
      insights.demandLevel,
      ["High", "Medium", "Low"],
      "Medium"
    ),
    marketOutlook: normaliseEnum(
      insights.marketOutlook,
      ["Positive", "Neutral", "Negative"],
      "Neutral"
    ),
  };
};

export async function getIndustryInsights() {
  if (DEMO_MODE) {
    await demoDelay();
    return demoInsights;
  }

  const user = await requireUser();

  if (!user.industry) {
    throw new Error("Complete onboarding to see industry insights");
  }

  const existing = await db.industryInsight.findUnique({
    where: { industry: user.industry },
  });

  if (existing) return existing;

  // Another request may have created the row while this one was calling the
  // model, so the write is an idempotent upsert rather than a bare create.
  const insights = await generateAIInsights(user.industry);

  return db.industryInsight.upsert({
    where: { industry: user.industry },
    update: {},
    create: {
      industry: user.industry,
      ...insights,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}
