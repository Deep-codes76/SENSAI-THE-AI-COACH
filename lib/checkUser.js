import { currentUser } from "@clerk/nextjs/server";

import { DEMO_MODE, demoUser } from "./demo";
import { db } from "./prisma";

/**
 * Mirror the Clerk user into our database on first sight, and keep the cached
 * name/avatar fresh afterwards.
 */
export const checkUser = async () => {
  if (DEMO_MODE) return demoUser;

  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "User";

  try {
    // `upsert` closes the race where two parallel requests for a brand-new
    // user both saw "not found" and both tried to insert.
    return await db.user.upsert({
      where: { clerkUserId: user.id },
      update: { name, imageUrl: user.imageUrl, email },
      create: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });
  } catch (error) {
    // Never take the whole page down because the profile mirror failed.
    console.error("checkUser failed:", error);
    return null;
  }
};
