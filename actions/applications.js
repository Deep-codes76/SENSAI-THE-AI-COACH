"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { DEMO_MODE, demoApplications, demoDelay } from "@/lib/demo";
import { APPLICATION_STATUSES } from "@/app/lib/application-status";

const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(120),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\/.+/i.test(v), {
      message: "Enter a full URL starting with http:// or https://",
    }),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  salary: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["saved", "applied", "interviewing", "offer", "rejected"]),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

const clean = (value) => (value?.trim() ? value.trim() : null);

/**
 * The tracker table ships in a migration. If a deployment merges the code
 * before running it, every tracker query would throw P2021 and 500 the page;
 * this turns that into an explicit, actionable empty state instead.
 */
const MISSING_TABLE = "P2021";

function isMissingTable(error) {
  return error?.code === MISSING_TABLE;
}

export async function getApplications() {
  if (DEMO_MODE) {
    await demoDelay(250);
    return { applications: demoApplications, migrationPending: false };
  }

  const user = await requireUser();

  try {
    const applications = await db.jobApplication.findMany({
      where: { userId: user.id },
      orderBy: [{ updatedAt: "desc" }],
    });
    return { applications, migrationPending: false };
  } catch (error) {
    if (isMissingTable(error)) {
      console.warn("JobApplication table missing — run `prisma migrate deploy`");
      return { applications: [], migrationPending: true };
    }
    throw error;
  }
}

export async function createApplication(input) {
  if (DEMO_MODE) {
    await demoDelay(500);
    return { success: true };
  }

  const user = await requireUser();
  const data = applicationSchema.parse(input);

  await db.jobApplication.create({
    data: {
      userId: user.id,
      company: data.company,
      role: data.role,
      location: clean(data.location),
      url: clean(data.url),
      source: clean(data.source),
      salary: clean(data.salary),
      status: data.status,
      notes: clean(data.notes),
      // Recording "applied" implies a date; backfill it rather than asking.
      appliedAt: data.status === "saved" ? null : new Date(),
    },
  });

  revalidatePath("/applications");
  return { success: true };
}

export async function updateApplication(id, input) {
  if (DEMO_MODE) {
    await demoDelay(400);
    return { success: true };
  }

  const user = await requireUser();
  const data = applicationSchema.parse(input);

  const existing = await db.jobApplication.findFirst({
    where: { id, userId: user.id },
    select: { appliedAt: true },
  });

  if (!existing) throw new Error("Application not found");

  const { count } = await db.jobApplication.updateMany({
    where: { id, userId: user.id },
    data: {
      company: data.company,
      role: data.role,
      location: clean(data.location),
      url: clean(data.url),
      source: clean(data.source),
      salary: clean(data.salary),
      status: data.status,
      notes: clean(data.notes),
      appliedAt:
        data.status === "saved"
          ? null
          : (existing.appliedAt ?? new Date()),
    },
  });

  if (count === 0) throw new Error("Application not found");

  revalidatePath("/applications");
  return { success: true };
}

/** Used by the board when a card is moved between columns. */
export async function updateApplicationStatus(id, status) {
  if (DEMO_MODE) {
    await demoDelay(250);
    return { success: true };
  }

  if (!APPLICATION_STATUSES.includes(status)) {
    throw new Error("Unknown status");
  }

  const user = await requireUser();

  const existing = await db.jobApplication.findFirst({
    where: { id, userId: user.id },
    select: { appliedAt: true },
  });

  if (!existing) throw new Error("Application not found");

  await db.jobApplication.updateMany({
    where: { id, userId: user.id },
    data: {
      status,
      appliedAt:
        status === "saved" ? null : (existing.appliedAt ?? new Date()),
    },
  });

  revalidatePath("/applications");
  return { success: true };
}

export async function deleteApplication(id) {
  if (DEMO_MODE) {
    await demoDelay(300);
    return { success: true };
  }

  const user = await requireUser();

  const { count } = await db.jobApplication.deleteMany({
    where: { id, userId: user.id },
  });

  if (count === 0) throw new Error("Application not found");

  revalidatePath("/applications");
  return { success: true };
}
