import { NextResponse } from "next/server";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { markOrderPaid, markPaymentRefunded } from "@/lib/leads/engine";
import { verifyWebhookSignature } from "@/lib/payments/signature";

export const runtime = "nodejs";

/**
 * Razorpay webhook. Order of operations matters:
 * 1. verify the signature over the RAW body  2. dedupe on x-razorpay-event-id (unique _id)  3. apply via idempotent functions.
 * If applying fails we delete the dedupe row and return 500 so Razorpay retries instead of losing the event.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const db = await getDb();
  if (!secret || !db) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature, secret)) return NextResponse.json({ error: "invalid signature" }, { status: 400 });

  const eventId = request.headers.get("x-razorpay-event-id");
  if (!eventId) return NextResponse.json({ error: "missing event id" }, { status: 400 });

  let event: { event?: string; payload?: Record<string, { entity?: Record<string, unknown> }> };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const type = String(event.event ?? "");

  const events = col(db).webhookEvents;
  try {
    await events.insertOne({ _id: eventId, eventType: type, createdAt: new Date() });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return NextResponse.json({ ok: true, duplicate: true }); // already handled
    return NextResponse.json({ error: "storage error" }, { status: 500 });
  }

  try {
    const payment = event.payload?.payment?.entity as { id?: string; order_id?: string; amount?: number } | undefined;
    const refund = event.payload?.refund?.entity as { payment_id?: string } | undefined;

    if ((type === "payment.captured" || type === "order.paid") && payment?.id && payment.order_id && typeof payment.amount === "number") {
      await markOrderPaid(db, payment.order_id, payment.id, payment.amount, "webhook");
    } else if (type === "refund.processed" && refund?.payment_id) {
      await markPaymentRefunded(db, refund.payment_id);
    }
    // payment.failed is deliberately NOT turned into order failure: Razorpay lets the customer retry on the same
    // order, and a later success must still be honoured.
    return NextResponse.json({ ok: true });
  } catch {
    await events.deleteOne({ _id: eventId });
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
