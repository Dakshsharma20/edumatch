"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, newId } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import type { InstituteDoc } from "@/lib/db/types";
import type { ActionResult } from "@/lib/validation/auth";

type Decision = "approve" | "reject" | "suspend";

/**
 * Admin decision on an institute application. The admin role is re-read from the database on the server.
 * Allowed transitions only: approve (submitted|suspended -> published+verified), reject (submitted), suspend (published).
 * "approve" marks the listing Verified, so the admin must have reviewed the documents first.
 */
export async function decideInstitute(instituteId: string, decision: Decision, note?: string): Promise<ActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(instituteId) || !["approve", "reject", "suspend"].includes(decision)) return { ok: false, error: "Invalid request." };
  const db = await getDb();
  if (!db) return { ok: false, preview: true, error: "The database is not configured." };
  const user = await getCurrentUser();
  if (!user?.roles.includes("admin")) return { ok: false, error: "Not authorised." };

  const rule: Record<Decision, { from: InstituteDoc["status"][]; set: Partial<InstituteDoc> }> = {
    approve: { from: ["submitted", "suspended"], set: { status: "published", verification: "verified" } },
    reject: { from: ["submitted"], set: { status: "rejected", verification: "not_verified" } },
    suspend: { from: ["published"], set: { status: "suspended" } },
  };
  const { from, set } = rule[decision];
  const c = col(db);
  const r = await c.institutes.updateOne({ _id: instituteId, status: { $in: from } }, { $set: { ...set, updatedAt: new Date() } });
  if (!r.matchedCount) return { ok: false, error: "That institute is not in a state that allows this decision." };

  try {
    await c.auditLogs.insertOne({ _id: newId(), actorId: user.id, action: `institute_${decision}`, targetType: "institute", targetId: instituteId, meta: { note: note?.slice(0, 500) ?? null }, createdAt: new Date() });
  } catch {
    return { ok: false, error: "Decision applied, but the audit log write failed. Please report this." };
  }
  revalidatePath("/admin/verifications");
  return { ok: true, message: `Institute ${decision}d.` };
}
