"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateText } from "@/lib/ai";
import {
  DEMO_MODE,
  demoCoverLetters,
  demoDelay,
} from "@/lib/demo";

export async function generateCoverLetter(data) {
  if (DEMO_MODE) {
    await demoDelay(1600);
    return { id: demoCoverLetters[0].id };
  }

  const user = await requireUser();

  const prompt = `
Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.

About the candidate:
- Industry: ${user.industry ?? "not specified"}
- Years of experience: ${user.experience ?? "not specified"}
- Skills: ${user.skills?.join(", ") || "not specified"}
- Professional background: ${user.bio || "not specified"}

Job description:
${data.jobDescription}

Requirements:
1. Professional, enthusiastic tone.
2. Highlight the skills and experience the job description asks for.
3. Show an understanding of the company's needs.
4. Keep it under 400 words.
5. Use proper business letter formatting in markdown.
6. Include specific, plausible examples of achievements.
7. Connect the candidate's background to the job requirements.

Respond with the markdown letter only.
`;

  try {
    const content = await generateText(prompt);

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    revalidatePath("/ai-cover-letter");

    // Only the id is needed to navigate to the new letter; returning the whole
    // row shipped the full generated body back through the action payload.
    return { id: coverLetter.id };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error(error?.message || "Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  if (DEMO_MODE) {
    await demoDelay(250);
    return demoCoverLetters;
  }

  const user = await requireUser();
  return db.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCoverLetter(id) {
  if (DEMO_MODE) {
    await demoDelay(250);
    return demoCoverLetters.find((l) => l.id === id) ?? demoCoverLetters[0];
  }

  const user = await requireUser();
  if (!id) return null;

  // Scoped by userId so a guessed id cannot read someone else's letter.
  return db.coverLetter.findFirst({ where: { id, userId: user.id } });
}

export async function deleteCoverLetter(id) {
  if (DEMO_MODE) {
    await demoDelay(400);
    return { success: true };
  }

  const user = await requireUser();

  // deleteMany is scoped by userId, so a forged id deletes nothing rather than
  // throwing a record-not-found error that reveals the row exists.
  const { count } = await db.coverLetter.deleteMany({
    where: { id, userId: user.id },
  });

  if (count === 0) throw new Error("Cover letter not found");

  revalidatePath("/ai-cover-letter");
  return { success: true };
}

export async function updateCoverLetter(id, content) {
  if (DEMO_MODE) {
    await demoDelay(500);
    return { success: true };
  }

  const user = await requireUser();

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Cover letter content cannot be empty");
  }

  try {
    const { count } = await db.coverLetter.updateMany({
      where: { id, userId: user.id },
      data: { content },
    });

    if (count === 0) throw new Error("Cover letter not found");

    revalidatePath(`/ai-cover-letter/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating cover letter:", error);
    throw new Error(error?.message || "Failed to update cover letter");
  }
}
