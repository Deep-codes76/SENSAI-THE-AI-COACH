"use server";

import { z } from "zod";

import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateJson, generateText } from "@/lib/ai";
import {
  DEMO_MODE,
  demoAssessments,
  demoDelay,
  demoQuiz,
} from "@/lib/demo";

const QUESTION_COUNT = 10;

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctAnswer: z.string().min(1),
        explanation: z.string().min(1),
      })
    )
    .min(1),
});

export async function generateQuiz() {
  if (DEMO_MODE) {
    await demoDelay(1100);
    return demoQuiz;
  }

  const user = await requireUser({ industry: true, skills: true });

  if (!user.industry) {
    throw new Error("Complete onboarding before starting a mock interview");
  }

  const prompt = `
Generate ${QUESTION_COUNT} technical interview questions for a ${user.industry} professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

Each question is multiple choice with exactly 4 distinct options.

Return ONLY JSON in this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}

Rules:
- "correctAnswer" must be character-for-character identical to one of the "options".
- Do not number the options or prefix them with letters.
- Keep each explanation to one or two sentences.
`;

  try {
    const raw = await generateJson(prompt);
    const parsed = quizSchema.safeParse(raw);

    if (!parsed.success) {
      console.error("Invalid quiz payload:", parsed.error.flatten());
      throw new Error("The AI returned questions in an unexpected format.");
    }

    // The model sometimes returns a correctAnswer that is a near-miss of one
    // of the options (trailing period, different case). Without this, those
    // questions are unanswerable: every choice scores as wrong.
    const questions = parsed.data.questions
      .map((q) => {
        const exact = q.options.find((o) => o === q.correctAnswer);
        if (exact) return q;

        const loose = q.options.find(
          (o) =>
            o.trim().toLowerCase().replace(/[.]$/, "") ===
            q.correctAnswer.trim().toLowerCase().replace(/[.]$/, "")
        );
        return loose ? { ...q, correctAnswer: loose } : null;
      })
      .filter(Boolean);

    if (!questions.length) {
      throw new Error("The AI returned no usable questions. Please try again.");
    }

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error(error?.message || "Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  if (DEMO_MODE) {
    await demoDelay(700);
    return {
      id: "demo-result",
      quizScore: score,
      category: "Technical",
      createdAt: new Date(),
      improvementTip:
        "Demo mode: in the live app this tip is generated from the questions you got wrong.",
      questions: questions.map((q, i) => ({
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: answers?.[i] ?? null,
        isCorrect: q.correctAnswer === answers?.[i],
        explanation: q.explanation,
      })),
    };
  }

  const user = await requireUser();

  if (!Array.isArray(questions) || !questions.length) {
    throw new Error("No quiz questions to save");
  }

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers?.[index] ?? null,
    isCorrect: q.correctAnswer === answers?.[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    try {
      improvementTip = await generateText(`
The user got the following ${user.industry} technical interview questions wrong:

${wrongQuestionsText}

Based on these mistakes, give one concise, specific improvement tip.
Focus on the knowledge gaps the wrong answers reveal.
Keep it under two sentences and make it encouraging.
Do not mention the mistakes explicitly; focus on what to learn or practise.
`);
    } catch (error) {
      // A missing tip is cosmetic. Losing the user's quiz result is not, so
      // this failure must never prevent the assessment from being saved.
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
    return await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  if (DEMO_MODE) {
    await demoDelay(300);
    return demoAssessments;
  }

  const user = await requireUser();

  try {
    // Newest first: the UI labels the top entry "Latest" and the stats cards
    // read index 0, both of which were showing the oldest quiz.
    return await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
