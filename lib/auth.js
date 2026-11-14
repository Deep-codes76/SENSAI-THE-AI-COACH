import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/prisma";
import { DEMO_MODE, demoUser } from "@/lib/demo";

/**
 * Resolve the signed-in Clerk user to our own User row.
 *
 * Every server action needs this, and every one of them used to repeat the
 * same six lines, so a few of them drifted out of sync. Keeping it here means
 * the authorization check is defined once.
 */
export async function requireUser(select) {
  if (DEMO_MODE) return demoUser;

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    ...(select ? { select } : {}),
  });

  if (!user) throw new Error("User not found");
  return user;
}
