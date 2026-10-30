// Run: MONGODB_TEST_URI=mongodb://127.0.0.1:27017 node --experimental-strip-types tests/leads/engine.test.mts
// Needs a MongoDB-compatible server. Uses a throwaway database that is dropped at the end.
import assert from "node:assert/strict";
import { randomUUID as id } from "node:crypto";
import { MongoClient } from "mongodb";
import { col } from "../../src/lib/db/collections.ts";
import { ensureIndexes } from "../../src/lib/db/indexes.ts";
import { leadsForOrder, markOrderPaid, markPaymentRefunded, withdrawEnquiry } from "../../src/lib/leads/engine.ts";
import type { EnquiryDoc, LeadOrderDoc } from "../../src/lib/db/types.ts";

const uri = process.env.MONGODB_TEST_URI ?? "mongodb://127.0.0.1:27017";
const client = await new MongoClient(uri).connect();
const db = client.db(`edumatch_test_${Date.now()}`);
await ensureIndexes(db, { compat: process.env.MONGO_COMPAT !== "0" });
const c = col(db);
let n = 0;
const ok = (name: string) => console.log(`  ok ${++n} ${name}`);

const DAY = 86_400_000;
async function enquiry(o: Partial<EnquiryDoc> & { consent?: boolean } = {}) {
  const { consent = true, ...rest } = o;
  const e: EnquiryDoc = {
    _id: id(), studentId: id(), studentName: "Test Student", contactMethod: "phone", phone: "9" + String(Math.floor(Math.random() * 1e9)).padStart(9, "0"),
    city: "Pune", course: "JEE", cityKey: "pune", courseKey: "jee", isMinor: false, status: "valid", duplicateOf: null, allocationCount: 0,
    createdAt: new Date(Date.now() - 1000), ...rest,
  } as EnquiryDoc;
  await c.enquiries.insertOne(e);
  if (consent) await c.consents.insertOne({ _id: id(), studentId: e.studentId, enquiryId: e._id, purpose: "lead_marketplace", granted: true, policyVersion: "t", disclosureText: "t", createdAt: new Date(), withdrawnAt: null });
  return e;
}
async function order(o: Partial<LeadOrderDoc> = {}) {
  const ord: LeadOrderDoc = {
    _id: id(), buyerType: "institute", buyerId: id(), buyerUserId: id(), packageId: id(), quantity: 2, amountPaise: 150000,
    criteria: { course: "JEE", city: "Pune" }, maxAgeDays: 30, status: "created", razorpayOrderId: "order_" + id().slice(0, 8), allocatedCount: 0, createdAt: new Date(), ...o,
  };
  await c.leadOrders.insertOne(ord);
  return ord;
}
const pay = (o: LeadOrderDoc, p = "pay_" + id().slice(0, 8), amt = o.amountPaise) => markOrderPaid(db, o.razorpayOrderId!, p, amt, "test");
const fresh = async (o: LeadOrderDoc) => (await c.leadOrders.findOne({ _id: o._id }))!;
const allocs = (o: LeadOrderDoc) => c.allocations.countDocuments({ orderId: o._id });

try {
  // --- payment basics ---
  for (let i = 0; i < 3; i++) await enquiry();
  const o1 = await order({ quantity: 2 });
  const p1 = "pay_one";
  assert.equal(await pay(o1, p1), o1._id);
  assert.equal((await fresh(o1)).status, "fulfilled"); assert.equal(await allocs(o1), 2); ok("paid order is fulfilled with exactly `quantity` leads");
  assert.equal(await pay(o1, p1), o1._id); assert.equal(await allocs(o1), 2); ok("replaying the same payment id is idempotent");
  assert.equal(await pay(o1, "pay_two"), o1._id); assert.equal(await allocs(o1), 2);
  assert.equal(await c.payments.countDocuments({ orderId: o1._id }), 2); ok("a second payment id is recorded but never re-allocates");
  await assert.rejects(c.payments.insertOne({ _id: id(), orderId: o1._id, razorpayOrderId: "x", razorpayPaymentId: p1, amountPaise: 1, status: "captured", source: "t", createdAt: new Date() }), { code: 11000 }); ok("razorpayPaymentId is unique at the database level");

  const o2 = await order();
  assert.equal(await pay(o2, "pay_bad", o2.amountPaise - 100), null);
  assert.equal((await fresh(o2)).status, "created"); assert.equal(await allocs(o2), 0); ok("amount mismatch is recorded, not applied");
  await assert.rejects(markOrderPaid(db, "order_nope", "pay_x", 1, "t"), /unknown order/); ok("unknown order is rejected");

  // --- eligibility ---
  const E = {
    good: await enquiry({ course: "NEET", courseKey: "neet", city: "Delhi", cityKey: "delhi" }),
    wrongCourse: await enquiry({ course: "CAT", courseKey: "cat", city: "Delhi", cityKey: "delhi" }),
    wrongCity: await enquiry({ course: "NEET", courseKey: "neet", city: "Mumbai", cityKey: "mumbai" }),
    noConsent: await enquiry({ course: "NEET", courseKey: "neet", city: "Delhi", cityKey: "delhi", consent: false }),
    dup: await enquiry({ course: "NEET", courseKey: "neet", city: "Delhi", cityKey: "delhi", duplicateOf: id() }),
    old: await enquiry({ course: "NEET", courseKey: "neet", city: "Delhi", cityKey: "delhi", createdAt: new Date(Date.now() - 90 * DAY) }),
    withdrawn: await enquiry({ course: "NEET", courseKey: "neet", city: "Delhi", cityKey: "delhi", status: "withdrawn" }),
  };
  const oe = await order({ quantity: 10, criteria: { course: "neet", city: "DELHI" } });
  await pay(oe);
  const got = (await c.allocations.find({ orderId: oe._id }).toArray()).map((a) => a.enquiryId);
  assert.deepEqual(got, [E.good._id]); assert.equal((await fresh(oe)).status, "partially_fulfilled"); assert.equal((await fresh(oe)).allocatedCount, 1);
  ok("only matching, consented, non-duplicate, recent, unwithdrawn leads are allocated; shortfall is partial");

  // --- never twice to same buyer ---
  const buyer = { buyerId: id(), buyerUserId: id() };
  for (let i = 0; i < 3; i++) await enquiry({ course: "UPSC", courseKey: "upsc" });
  const a = await order({ ...buyer, quantity: 2, criteria: { course: "UPSC", city: "Pune" } }); await pay(a);
  const b = await order({ ...buyer, quantity: 2, criteria: { course: "UPSC", city: "Pune" } }); await pay(b);
  const ids = (await c.allocations.find({ buyerId: buyer.buyerId }).toArray()).map((x) => x.enquiryId);
  assert.equal(new Set(ids).size, ids.length); assert.equal(ids.length, 3); assert.equal((await fresh(b)).status, "partially_fulfilled");
  ok("the same buyer never receives the same enquiry twice");

  // --- cap of 3 buyers, sequential ---
  const only = await enquiry({ course: "GATE", courseKey: "gate" });
  const results: number[] = [];
  for (let i = 0; i < 4; i++) { const o = await order({ quantity: 1, criteria: { course: "GATE", city: "Pune" } }); await pay(o); results.push(await allocs(o)); }
  assert.deepEqual(results, [1, 1, 1, 0]); assert.equal(await c.allocations.countDocuments({ enquiryId: only._id }), 3); ok("an enquiry is sold to at most 3 buyers");

  // --- concurrency ---
  const hot = await order({ quantity: 2, criteria: { course: "CLAT", city: "Pune" } });
  for (let i = 0; i < 4; i++) await enquiry({ course: "CLAT", courseKey: "clat" });
  await Promise.all(Array.from({ length: 8 }, () => pay(hot, "pay_same")));
  assert.equal(await allocs(hot), 2); assert.equal(await c.payments.countDocuments({ razorpayPaymentId: "pay_same" }), 1); ok("8 concurrent replays of one payment allocate exactly once");
  const scarce = [await enquiry({ course: "SSC", courseKey: "ssc" }), await enquiry({ course: "SSC", courseKey: "ssc" })];
  const rivals = await Promise.all(Array.from({ length: 6 }, () => order({ quantity: 2, criteria: { course: "SSC", city: "Pune" } })));
  await Promise.all(rivals.map((r) => pay(r)));
  for (const s of scarce) assert.ok((await c.allocations.countDocuments({ enquiryId: s._id })) <= 3);
  for (const r of rivals) assert.ok((await allocs(r)) <= 2);
  assert.equal(await c.allocations.countDocuments({ enquiryId: { $in: scarce.map((s) => s._id) } }), 6); // 2 enquiries x 3 buyers
  ok("concurrent buyers can never push an enquiry past the cap or an order past its quantity");

  // --- crash repair ---
  const stuck = await order({ quantity: 1, status: "paid", criteria: { course: "CA", city: "Pune" } });
  await enquiry({ course: "CA", courseKey: "ca" });
  await markOrderPaid(db, stuck.razorpayOrderId!, "pay_stuck", stuck.amountPaise, "webhook");
  assert.equal((await fresh(stuck)).status, "fulfilled"); ok("an order stuck at 'paid' after a crash is completed by the next retry");

  // --- retry after failure ---
  const failed = await order({ quantity: 1, status: "failed", criteria: { course: "CA", city: "Pune" } });
  await enquiry({ course: "CA", courseKey: "ca" });
  await pay(failed); assert.equal((await fresh(failed)).status, "fulfilled"); ok("a later successful payment on a 'failed' order is honoured");

  // --- consent withdrawal and isolation ---
  const stu = id();
  const mine = await enquiry({ studentId: stu, course: "NDA", courseKey: "nda" });
  const bo = await order({ quantity: 1, criteria: { course: "NDA", city: "Pune" } }); await pay(bo);
  assert.equal((await leadsForOrder(db, bo.buyerUserId, bo._id))!.length, 1);
  assert.equal(await leadsForOrder(db, id(), bo._id), null); ok("another user cannot read a buyer's order");
  assert.equal(await withdrawEnquiry(db, id(), mine._id), false); ok("a student cannot withdraw someone else's enquiry");
  assert.equal(await withdrawEnquiry(db, stu, mine._id), true);
  assert.equal((await leadsForOrder(db, bo.buyerUserId, bo._id))!.length, 0);
  assert.equal(await c.consents.countDocuments({ enquiryId: mine._id, withdrawnAt: null }), 0);
  assert.equal(await c.auditLogs.countDocuments({ action: "consent_withdrawn", targetId: mine._id }), 1); ok("withdrawal removes buyer access, closes consent and is audit-logged");
  const later = await order({ quantity: 1, criteria: { course: "NDA", city: "Pune" } }); await pay(later);
  assert.equal(await allocs(later), 0); ok("a withdrawn enquiry is never sold afterwards");

  // --- refund ---
  await markPaymentRefunded(db, p1);
  assert.equal((await fresh(o1)).status, "refunded"); assert.equal(await allocs(o1), 2); ok("refund bookkeeping updates status and leaves allocations for an admin to decide");

  console.log(`\nSTAGE 3 MONGO ENGINE CHECKS PASSED (${n})`);
} finally {
  await db.dropDatabase();
  await client.close();
}
