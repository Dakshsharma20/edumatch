"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, newId } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import type { ConsentDoc } from "@/lib/db/types";
import { withdrawEnquiry } from "./engine";
import { enquirySchema } from "@/lib/validation/leads";
import { LEAD_DISCLOSURE, MARKETING_DISCLOSURE, POLICY_VERSION } from "./disclosure";
import type { ActionResult } from "@/lib/validation/auth";

const normPhone = (p: string) => p.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");

/**
 * Creates an enquiry plus purpose-specific consent records, all under the student's own session.
 * Lead-sharing consent and marketing consent are separate rows. Nothing is shared with any provider here:
 * providers only get an enquiry after buying it and only while consent stands.
 */
export async function submitEnquiry(input: unknown): Promise<ActionResult> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const db = await getDb();
  if (!db) return { ok: false, preview: true, error: "The database is not configured, so nothing was saved." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to send an enquiry." };
  if (!user.roles.includes("student")) return { ok: false, error: "Only student accounts can send enquiries." };

  const v = parsed.data;
  const c = col(db);
  const now = new Date();
  let guardianId: string | null = null;
  if (v.isMinor) {
    guardianId = newId();
    await c.guardians.insertOne({ _id: guardianId, studentId: user.id, guardianName: v.guardianName ?? "", guardianPhone: normPhone(v.guardianPhone ?? ""), relationship: v.guardianRelationship ?? "", createdAt: now });
  }

  const phone = normPhone(v.phone);
  const courseKey = v.course.trim().toLowerCase();
  // Duplicate detection: same phone + course within 30 days. Flagged (never silently deleted); flagged enquiries are not sold.
  const dup = await c.enquiries.findOne({ phone, courseKey, status: "valid", createdAt: { $gt: new Date(now.getTime() - 30 * 86_400_000) } }, { sort: { createdAt: 1 }, projection: { _id: 1 } });
  const enquiryId = newId();
  try {
    await c.enquiries.insertOne({
      _id: enquiryId, studentId: user.id, studentName: v.studentName, contactMethod: v.contactMethod, phone, email: v.email || null,
      city: v.city, course: v.course, cityKey: v.city.trim().toLowerCase(), courseKey, level: v.level || null,
      budgetMin: v.budgetMin ?? null, budgetMax: v.budgetMax ?? null, mode: v.mode ?? null, preferredTiming: v.preferredTiming || null,
      isMinor: v.isMinor, guardianId, status: "valid", duplicateOf: dup?._id ?? null, allocationCount: 0, createdAt: now,
    });
  } catch {
    return { ok: false, error: "Could not save your enquiry. Please try again." };
  }

  const consents: ConsentDoc[] = [{ _id: newId(), enquiryId, studentId: user.id, purpose: "lead_marketplace", granted: true, policyVersion: POLICY_VERSION, disclosureText: LEAD_DISCLOSURE, createdAt: now, withdrawnAt: null }];
  if (v.consentMarketing) consents.push({ _id: newId(), enquiryId, studentId: user.id, purpose: "marketing", granted: true, policyVersion: POLICY_VERSION, disclosureText: MARKETING_DISCLOSURE, createdAt: now, withdrawnAt: null });
  try {
    await c.consents.insertMany(consents);
  } catch {
    // Without a consent record the enquiry is never eligible to be sold, so a failure here fails safe.
    return { ok: false, error: "Your enquiry was saved but your consent could not be recorded, so it will not be shared. Please submit again." };
  }

  revalidatePath("/student/enquiries");
  return { ok: true, message: "Enquiry saved. Matching providers can receive your details only after they choose your enquiry, and you can withdraw at any time.", redirectTo: "/student/enquiries" };
}

export async function withdrawEnquiryAction(enquiryId: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(enquiryId)) return { ok: false, error: "Invalid enquiry." };
  const db = await getDb();
  if (!db) return { ok: false, preview: true, error: "The database is not configured." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in first." };
  // Scoped to the signed-in student's own enquiry inside withdrawEnquiry.
  if (!(await withdrawEnquiry(db, user.id, enquiryId))) return { ok: false, error: "Could not withdraw this enquiry." };
  revalidatePath("/student/enquiries"); revalidatePath("/student/privacy");
  return { ok: true, message: "Consent withdrawn. This enquiry will no longer be shared." };
}
