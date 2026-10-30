// Deliberately free of "@/" aliases and next/* imports so tests can run it directly under plain Node.
import { randomUUID } from "node:crypto";
import type { Db } from "mongodb";
import { col } from "../db/collections.ts";
import type { EnquiryDoc, LeadOrderDoc } from "../db/types.ts";
import { MAX_PROVIDERS_PER_ENQUIRY } from "./constants.ts";

const newId = () => randomUUID();

/*
 * Lead allocation and payment bookkeeping on MongoDB. There are no database-side triggers or RLS here, so the
 * guarantees come from three things, all exercised by tests/leads/engine.test.mts:
 *   1. UNIQUE indexes (payments.razorpayPaymentId, allocations buyer+enquiry, webhook event ids)
 *   2. single-document atomic updates (order status transition, per-enquiry allocationCount cap, order lock)
 *   3. every step is safe to repeat, so a crash midway is repaired by the next webhook retry
 */

const isDup = (e: unknown) => (e as { code?: number })?.code === 11000;
const LOCK_MS = 2 * 60_000;

/** Idempotent. Returns the order id when the order is paid, null when the amount did not match or the order is in an unpayable state. */
export async function markOrderPaid(db: Db, rzpOrderId: string, rzpPaymentId: string, amountPaise: number, source: string): Promise<string | null> {
  const c = col(db);
  const order = await c.leadOrders.findOne({ razorpayOrderId: rzpOrderId });
  if (!order) throw new Error("unknown order");

  const matches = amountPaise === order.amountPaise;
  try {
    await c.payments.insertOne({ _id: newId(), orderId: order._id, razorpayOrderId: rzpOrderId, razorpayPaymentId: rzpPaymentId, amountPaise, status: matches ? "captured" : "amount_mismatch", source, createdAt: new Date() });
  } catch (e) {
    if (!isDup(e)) throw e; // same payment id replayed: already recorded
  }
  if (!matches) return null;

  // Atomic claim: exactly one caller moves created/failed -> paid. A retry after a failed attempt on the same order is legitimate.
  const claimed = await c.leadOrders.findOneAndUpdate({ _id: order._id, status: { $in: ["created", "failed"] } }, { $set: { status: "paid", paidAt: new Date() } });
  const current = claimed ? { ...claimed, status: "paid" as const } : await c.leadOrders.findOne({ _id: order._id });
  if (!current) return null;
  if (current.status === "paid") await fulfillOrder(db, order._id); // also repairs an order stuck at 'paid' after a crash
  if (["paid", "fulfilled", "partially_fulfilled"].includes(current.status)) return order._id;
  return null;
}

/** Allocates up to `quantity` eligible enquiries. Safe to call repeatedly and concurrently. */
export async function fulfillOrder(db: Db, orderId: string): Promise<void> {
  const c = col(db);
  const now = new Date();
  const o = await c.leadOrders.findOneAndUpdate(
    { _id: orderId, status: "paid", $or: [{ lockedAt: null }, { lockedAt: { $exists: false } }, { lockedAt: { $lt: new Date(now.getTime() - LOCK_MS) } }] },
    { $set: { lockedAt: now } },
    { returnDocument: "after" },
  );
  if (!o) return; // not paid, already fulfilled, or another worker holds it

  let got = await c.allocations.countDocuments({ orderId }); // already allocated by an earlier, interrupted run
  const cutoff = new Date(now.getTime() - o.maxAgeDays * 86_400_000);
  const modeFilter = o.criteria.mode && o.criteria.mode !== "hybrid"
    ? { $or: [{ mode: null }, { mode: { $exists: false } }, { mode: "hybrid" as const }, { mode: o.criteria.mode }] }
    : {};
  // allocationCount is only a pre-filter to skip full enquiries cheaply. The truth is the unique slot indexes below.
  const cursor = c.enquiries.find({
    status: "valid", duplicateOf: null, createdAt: { $gt: cutoff }, courseKey: o.criteria.course.toLowerCase(), cityKey: o.criteria.city.toLowerCase(),
    allocationCount: { $lt: MAX_PROVIDERS_PER_ENQUIRY }, ...modeFilter,
  } as never).sort({ createdAt: 1 });

  outer: for await (const e of cursor as AsyncIterable<EnquiryDoc>) {
    if (got >= o.quantity) break;
    if (!(await c.consents.findOne({ enquiryId: e._id, purpose: "lead_marketplace", granted: true, withdrawnAt: null }))) continue;
    if (await c.allocations.findOne({ buyerType: o.buyerType, buyerId: o.buyerId, enquiryId: e._id })) continue; // this buyer already has it

    let placed = false;
    for (let enquirySlot = 1; enquirySlot <= MAX_PROVIDERS_PER_ENQUIRY && !placed; enquirySlot++) {
      try {
        await c.allocations.insertOne({ _id: newId(), orderId, buyerType: o.buyerType, buyerId: o.buyerId, enquiryId: e._id, orderSlot: got + 1, enquirySlot, createdAt: new Date() });
        placed = true;
      } catch (err) {
        if (!isDup(err)) throw err;
        if (await c.allocations.findOne({ orderId, orderSlot: got + 1 })) break outer; // another worker is filling this order: stop, it will finish
        if (await c.allocations.findOne({ buyerType: o.buyerType, buyerId: o.buyerId, enquiryId: e._id })) continue outer; // buyer already has this enquiry
        // otherwise this enquiry slot was taken by another buyer: try the next slot (all taken = enquiry is full)
      }
    }
    if (!placed) continue;
    await c.enquiries.updateOne({ _id: e._id }, { $inc: { allocationCount: 1 } });
    got++;
  }

  const total = await c.allocations.countDocuments({ orderId }); // the allocations are the source of truth; the order row is a summary
  await c.leadOrders.updateOne({ _id: orderId }, {
    $set: { allocatedCount: total, status: total >= o.quantity ? "fulfilled" : "partially_fulfilled", fulfilledAt: new Date(), lockedAt: null },
  });
}

/** Refund bookkeeping only. Allocated leads are NOT auto-revoked: an admin decides (policy question). */
export async function markPaymentRefunded(db: Db, rzpPaymentId: string): Promise<void> {
  const c = col(db);
  const p = await c.payments.findOneAndUpdate({ razorpayPaymentId: rzpPaymentId }, { $set: { status: "refunded" } });
  if (p) await c.leadOrders.updateOne({ _id: p.orderId }, { $set: { status: "refunded" } });
}

/** Student withdraws consent. Scoped to the student's own enquiry. Buyers lose access because every buyer read filters status = valid. */
export async function withdrawEnquiry(db: Db, studentId: string, enquiryId: string): Promise<boolean> {
  const c = col(db);
  const r = await c.enquiries.updateOne({ _id: enquiryId, studentId, status: "valid" }, { $set: { status: "withdrawn", withdrawnAt: new Date() } });
  if (!r.matchedCount) return false;
  await c.consents.updateMany({ enquiryId, withdrawnAt: null }, { $set: { withdrawnAt: new Date() } });
  await c.auditLogs.insertOne({ _id: newId(), actorId: studentId, action: "consent_withdrawn", targetType: "enquiry", targetId: enquiryId, createdAt: new Date() });
  return true;
}

/** The leads a buyer may see for ONE of their own orders: allocated, and the student's consent still standing. */
export async function leadsForOrder(db: Db, userId: string, orderId: string): Promise<EnquiryDoc[] | null> {
  const c = col(db);
  const order: LeadOrderDoc | null = await c.leadOrders.findOne({ _id: orderId, buyerUserId: userId });
  if (!order) return null;
  const allocs = await c.allocations.find({ orderId }).sort({ createdAt: 1 }).toArray();
  if (!allocs.length) return [];
  const enq = await c.enquiries.find({ _id: { $in: allocs.map((a) => a.enquiryId) }, status: "valid" }).toArray();
  const byId = new Map(enq.map((e) => [e._id, e]));
  return allocs.map((a) => byId.get(a.enquiryId)).filter((e): e is EnquiryDoc => !!e);
}
