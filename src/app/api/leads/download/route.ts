import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { leadsForOrder } from "@/lib/leads/engine";
import { toCsv, verifyDownloadToken } from "@/lib/payments/signature";

export const runtime = "nodejs";
const deny = (status: number) => new NextResponse("Not available", { status, headers: { "Cache-Control": "no-store" } });

/**
 * CSV export of ONE order's allocated leads. Defence in depth:
 * valid unexpired signed token + signed-in user matching the token + the order must belong to that user
 * + only enquiries whose student consent still stands (withdrawn leads silently drop out). Every export is audit-logged.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.LEAD_EXPORT_SECRET;
  const token = request.nextUrl.searchParams.get("token");
  if (!secret || !token) return deny(404);
  const claims = verifyDownloadToken(token, secret);
  if (!claims) return deny(403);

  const user = await getCurrentUser();
  if (!user || user.id !== claims.u) return deny(403);
  const db = await getDb();
  if (!db) return deny(404);

  const leads = await leadsForOrder(db, user.id, claims.o);
  if (!leads) return deny(404);

  const csv = toCsv(
    ["Name", "Preferred contact", "Phone", "Email", "City", "Course", "Level", "Budget min (INR)", "Budget max (INR)", "Mode", "Preferred timing", "Student under 18", "Enquiry date"],
    leads.map((e) => [e.studentName, e.contactMethod, e.phone, e.email, e.city, e.course, e.level, e.budgetMin, e.budgetMax, e.mode, e.preferredTiming, e.isMinor ? "Yes" : "No", e.createdAt.toISOString().slice(0, 10)]),
  );

  await col(db).auditLogs.insertOne({ _id: randomUUID(), actorId: user.id, action: "lead_export", targetType: "lead_order", targetId: claims.o, meta: { rows: leads.length }, createdAt: new Date() });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${claims.o.slice(0, 8)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
