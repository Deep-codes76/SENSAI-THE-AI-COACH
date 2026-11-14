"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { DEMO_MODE, demoDelay } from "@/lib/demo";

import { generateAIInsights } from "./dashboard";

/**
 * Persist the onboarding profile.
 *
 * The AI call deliberately happens *before* the transaction: generating
 * insights takes several seconds, and holding a Postgres transaction open for
 * that long exhausted the pool and tripped Prisma's transaction timeout.
 */
export async function updateUser(data) {
  if (DEMO_MODE) {
    await demoDelay(900);
    return { success: true, industry: data.industry };
  }

  const user = await requireUser();

  const industry = data.industry;
  if (!industry) throw new Error("An industry is required");

  try {
    const existingInsight = await db.industryInsight.findUnique({
      where: { industry },
      select: { id: true },
    });

    const insights = existingInsight ? null : await generateAIInsights(industry);

    const updatedUser = await db.$transaction(async (tx) => {
      if (insights) {
        await tx.industryInsight.upsert({
          where: { industry },
          update: {},
          create: {
            industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return tx.user.update({
        where: { id: user.id },
        data: {
          industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills ?? [],
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    // Server action results must be serialisable, and the client only needs
    // to know the write landed — returning the whole row leaked the user's
    // record into the browser for no reason.
    return { success: true, industry: updatedUser.industry };
  } catch (error) {
    console.error("Error updating user and industry:", error);
    throw new Error(
      error?.message?.includes("AI")
        ? error.message
        : "Failed to update profile. Please try again."
    );
  }
}

export async function getUserOnboardingStatus() {
  if (DEMO_MODE) return { isOnboarded: true };

  const user = await requireUser({ industry: true });
  return { isOnboarded: Boolean(user.industry) };
}
