"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, newId } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { courseSchema, instituteApplicationSchema, parseFaculty, slugify } from "@/lib/validation/institute";
import type { ActionResult } from "@/lib/validation/auth";
import { myInstituteId } from "./scope";

const NOT_CONFIGURED: ActionResult = { ok: false, preview: true, error: "The database is not configured, so nothing was saved." };

/**
 * Creates the institute and sends it for admin review. Status is 'submitted', never 'published', and verification
 * is never set here: only an admin decision can do either. If any step fails, what was written is removed again.
 */
export async function submitInstituteApplication(input: unknown): Promise<ActionResult> {
  const parsed = instituteApplicationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const db = await getDb();
  if (!db) return NOT_CONFIGURED;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in first." };
  if (!user.roles.includes("institute")) return { ok: false, error: "Only institute accounts can submit an application." };
  const c = col(db);
  if (await myInstituteId(db, user.id)) return { ok: false, error: "Your institute application already exists. Edit it from your dashboard." };

  const v = parsed.data;
  const exams = v.exams.split(",").map((e) => e.trim()).filter(Boolean).slice(0, 20);
  const now = new Date();
  const id = newId();
  const courseId = newId();
  try {
    await c.institutes.insertOne({
      _id: id, slug: slugify(v.name), name: v.name, tagline: v.tagline || null, about: v.about, city: v.city, address: v.address, pincode: v.pincode,
      categories: exams, modes: [], languages: [], facilities: [], status: "submitted", verification: "not_verified", isDemo: false,
      createdBy: user.id, createdAt: now, updatedAt: now,
    });
    await c.instituteMembers.insertOne({ _id: newId(), instituteId: id, userId: user.id, memberRole: "owner", createdAt: now });
    await c.institutePrivate.insertOne({ _id: id, contactPerson: v.contactPerson, contactEmail: v.email, contactPhone: v.phone.replace(/^(\+91[\s-]?|0)/, ""), state: v.state, updatedAt: now });
    const fac = parseFaculty(v.faculty);
    if (fac.length) await c.faculty.insertMany(fac.map((f) => ({ _id: newId(), instituteId: id, name: f.name, qualification: f.qualification || null, experienceYears: f.experience_years, subjects: [], createdAt: now })));
    await c.courses.insertOne({
      _id: courseId, instituteId: id, name: exams[0] ?? v.name, exam: exams[0] ?? null, tuitionFeeInr: v.tuitionFee, otherFeesInr: 0, mode: "offline", demoEnabled: false, published: false,
      batches: [{ id: newId(), timing: v.batchTimings }], createdAt: now, updatedAt: now,
    });
  } catch {
    // Best-effort rollback so a retry starts clean.
    await Promise.allSettled([
      c.institutes.deleteOne({ _id: id }), c.instituteMembers.deleteMany({ instituteId: id }), c.institutePrivate.deleteOne({ _id: id }),
      c.faculty.deleteMany({ instituteId: id }), c.courses.deleteMany({ instituteId: id }),
    ]);
    return { ok: false, error: "Could not save your application. Nothing was submitted. Please try again." };
  }
  revalidatePath("/institute", "layout");
  return { ok: true, message: "Submitted for review. Our team will verify your documents before any verified badge is shown.", redirectTo: "/institute/dashboard" };
}

export async function saveCourse(input: unknown): Promise<ActionResult> {
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const db = await getDb();
  if (!db) return NOT_CONFIGURED;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in first." };
  const instituteId = await myInstituteId(db, user.id);
  if (!instituteId) return { ok: false, error: "Complete institute onboarding first." };

  const v = parsed.data;
  const fields = {
    name: v.name, exam: v.exam || null, level: v.level || null, durationMonths: v.durationMonths, tuitionFeeInr: v.tuitionFeeINR,
    otherFeesInr: v.otherFeesINR, mode: v.mode, batchSize: v.batchSize, syllabus: v.syllabus || null, demoEnabled: v.demoEnabled, updatedAt: new Date(),
  };
  const c = col(db);
  if (v.id) {
    // Filtered by instituteId too, so a forged course id belonging to another institute matches nothing.
    const r = await c.courses.updateOne({ _id: v.id, instituteId }, { $set: fields });
    if (!r.matchedCount) return { ok: false, error: "Could not update that course." };
  } else {
    await c.courses.insertOne({
      _id: newId(), instituteId, ...fields, published: false,
      batches: [{ id: newId(), timing: v.timing, seatsTotal: v.seats ?? null, seatsAvailable: v.seats ?? null }], createdAt: new Date(),
    });
  }
  revalidatePath("/institute/courses");
  return { ok: true, message: v.id ? "Course updated." : "Course created as unpublished." };
}

export async function setCoursePublished(courseId: string, published: boolean): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) return { ok: false, error: "Invalid course." };
  const db = await getDb();
  if (!db) return NOT_CONFIGURED;
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in first." };
  const instituteId = await myInstituteId(db, user.id);
  if (!instituteId) return { ok: false, error: "No institute found." };
  const r = await col(db).courses.updateOne({ _id: courseId, instituteId }, { $set: { published, updatedAt: new Date() } });
  if (!r.matchedCount) return { ok: false, error: "Could not change publish state." };
  revalidatePath("/institute/courses");
  return { ok: true };
}
