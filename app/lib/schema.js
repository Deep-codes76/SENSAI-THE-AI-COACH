import { z } from "zod";

/** Treat an empty string as "not provided" rather than as an invalid value. */
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^https?:\/\/.+/i.test(v), {
    message: "Enter a full URL starting with http:// or https://",
  });

export const onboardingSchema = z.object({
  industry: z.string({ required_error: "Please select an industry" }).min(1, "Please select an industry"),
  subIndustry: z
    .string({ required_error: "Please select a specialization" })
    .min(1, "Please select a specialization"),
  bio: z.string().max(500, "Keep your bio under 500 characters").optional(),
  experience: z
    .union([z.string(), z.number()])
    // An empty input used to become NaN and surface as
    // "Expected number, received nan"; this keeps the message human.
    .refine((v) => v !== "" && v !== null && v !== undefined, {
      message: "Years of experience is required",
    })
    .transform((v) => (typeof v === "number" ? v : parseInt(v, 10)))
    .refine((v) => Number.isFinite(v), {
      message: "Years of experience must be a number",
    })
    .refine((v) => v >= 0, { message: "Experience must be at least 0 years" })
    .refine((v) => v <= 50, { message: "Experience cannot exceed 50 years" }),
  skills: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : []
    ),
});

export const contactSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: optionalUrl,
  twitter: optionalUrl,
});

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine((data) => data.current || Boolean(data.endDate), {
    message: "End date is required unless this is your current position",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.current || !data.endDate || !data.startDate
        ? true
        : data.endDate >= data.startDate,
    {
      message: "End date cannot be before the start date",
      path: ["endDate"],
    }
  );

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema).default([]),
  education: z.array(entrySchema).default([]),
  projects: z.array(entrySchema).default([]),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z
    .string()
    .min(50, "Paste at least a short job description (50+ characters)"),
});
