"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateJson, generateText } from "@/lib/ai";
import {
  DEMO_MODE,
  demoAtsFeedback,
  demoDelay,
  demoResume,
} from "@/lib/demo";

export async function saveResume(content) {
  if (DEMO_MODE) {
    await demoDelay(600);
    return { ...demoResume, content };
  }

  const user = await requireUser();

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Resume content cannot be empty");
  }

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  if (DEMO_MODE) {
    await demoDelay(200);
    return demoResume;
  }

  const user = await requireUser();
  return db.resume.findUnique({ where: { userId: user.id } });
}

export async function improveWithAI({ current, type }) {
  if (DEMO_MODE) {
    await demoDelay(900);
    return `Led delivery of ${type} work end to end, shipping measurable outcomes: reduced p95 latency by 38%, cut build times from 14 to 4 minutes, and raised automated test coverage to 86% across the affected surface.`;
  }

  const user = await requireUser({ industry: true });

  if (!current?.trim()) throw new Error("There is nothing to improve yet");

  const prompt = `
As an expert resume writer, improve the following ${type} description for a ${
    user.industry ?? "technology"
  } professional.
Make it more impactful, quantifiable and aligned with industry standards.

Current content: "${current}"

Requirements:
1. Lead with strong action verbs.
2. Include metrics and results wherever they are plausible.
3. Highlight relevant technical skills.
4. Keep it concise but specific.
5. Focus on achievements rather than responsibilities.
6. Use industry-specific keywords an ATS would match.

Respond with a single paragraph and no preamble, labels or quotation marks.
`;

  try {
    return await generateText(prompt);
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

const atsSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
});

/**
 * Score a resume the way an applicant tracking system would.
 *
 * The `atsScore` and `feedback` columns existed in the schema from the start
 * but nothing ever wrote to them; this is the feature they were there for.
 */
export async function analyzeResume(content) {
  if (DEMO_MODE) {
    await demoDelay(1400);
    return demoAtsFeedback;
  }

  const user = await requireUser({ id: true, industry: true, skills: true });

  if (typeof content !== "string" || content.trim().length < 50) {
    throw new Error("Add more resume content before running an ATS check");
  }

  const prompt = `
You are an applicant tracking system (ATS) and a senior technical recruiter for
the ${user.industry ?? "technology"} industry.

Evaluate the resume below and return ONLY JSON in this shape:
{
  "score": number,
  "summary": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "missingKeywords": ["string"]
}

Scoring guidance:
- "score" is 0-100 and reflects parseability, keyword coverage, use of
  quantified achievements, and overall structure.
- "summary" is one or two sentences of plain feedback.
- Give 3-5 strengths and 3-5 concrete, actionable improvements.
- "missingKeywords" lists up to 8 relevant terms absent from the resume.

Resume:
"""
${content.slice(0, 12000)}
"""
`;

  try {
    const raw = await generateJson(prompt);
    const parsed = atsSchema.safeParse(raw);

    if (!parsed.success) {
      console.error("Invalid ATS payload:", parsed.error.flatten());
      throw new Error("The AI returned feedback in an unexpected format.");
    }

    const feedback = parsed.data;
    const score = Math.round(feedback.score);

    await db.resume.upsert({
      where: { userId: user.id },
      update: { content, atsScore: score, feedback: JSON.stringify(feedback) },
      create: {
        userId: user.id,
        content,
        atsScore: score,
        feedback: JSON.stringify(feedback),
      },
    });

    revalidatePath("/resume");
    return { ...feedback, score };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error(error?.message || "Failed to analyze resume");
  }
}
