import { z } from "zod";
import { INDIAN_MOBILE } from "@/lib/utils";

/** Single source of truth for institute onboarding: used by the wizard (UX) and the server action (authority). */
export const instituteApplicationSchema = z.object({
  name: z.string().trim().min(3, "Enter the institute name").max(150),
  tagline: z.string().trim().max(120, "Keep it under 120 characters").optional(),
  about: z.string().trim().min(30, "Describe your institute in at least 30 characters").max(4000),
  contactPerson: z.string().trim().min(2, "Enter a contact person").max(120),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().regex(INDIAN_MOBILE, "Enter a valid 10-digit Indian mobile number"),
  address: z.string().trim().min(10, "Enter the full address").max(500),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.string().trim().min(2, "Enter the state").max(80),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
  exams: z.string().trim().min(2, "List at least one course or exam").max(500),
  faculty: z.string().trim().min(2, "Add at least one faculty member").max(2000),
  tuitionFee: z.coerce.number({ error: "Enter a fee amount" }).int("Use a whole number").min(0, "Fee cannot be negative").max(10_000_000),
  batchTimings: z.string().trim().min(3, "Enter batch timings").max(500),
  documents: z.string().trim().max(1000).optional(),
  declaration: z.literal(true, { error: "You must confirm the declaration" }),
});

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3, "Enter a course name").max(150),
  exam: z.string().trim().max(80).optional(),
  level: z.string().trim().max(80).optional(),
  durationMonths: z.coerce.number({ error: "Enter the duration" }).int().min(1, "At least 1 month").max(120),
  tuitionFeeINR: z.coerce.number({ error: "Enter the tuition fee" }).int("Use a whole number").min(0).max(10_000_000),
  otherFeesINR: z.coerce.number({ error: "Enter 0 if none" }).int("Use a whole number").min(0).max(10_000_000),
  mode: z.enum(["online", "offline", "hybrid"]),
  batchSize: z.coerce.number({ error: "Enter the batch size" }).int().min(1).max(1000),
  timing: z.string().trim().min(3, "Enter a batch timing").max(120),
  seats: z.coerce.number().int().min(0).max(1000).optional(),
  syllabus: z.string().trim().max(4000).optional(),
  demoEnabled: z.boolean(),
});

export type InstituteApplicationInput = z.input<typeof instituteApplicationSchema>;
export type CourseInput = z.input<typeof courseSchema>;

/** "Name, qualification, years" per line. Anything unparseable is rejected rather than guessed. */
export function parseFaculty(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((line) => {
      const [name, qualification = "", years = ""] = line.split(",").map((p) => p.trim());
      const n = parseInt(years, 10);
      return { name, qualification, experience_years: Number.isFinite(n) && n >= 0 && n <= 70 ? n : null };
    })
    .filter((f) => f.name.length >= 2);
}

export function slugify(name: string) {
  const base = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "institute";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
