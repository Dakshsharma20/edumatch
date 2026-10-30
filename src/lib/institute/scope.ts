import "server-only";
import type { Db } from "mongodb";
import { col } from "@/lib/db/collections";

/** The institute the signed-in user belongs to. Every institute-side query starts from this, never from a client-supplied id. */
export async function myInstituteId(db: Db, userId: string): Promise<string | undefined> {
  const m = await col(db).instituteMembers.findOne({ userId });
  return m?.instituteId;
}
