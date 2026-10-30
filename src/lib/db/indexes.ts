import type { Db } from "mongodb";

/** Idempotent. The UNIQUE indexes here are load-bearing: they are what make payments and allocations safe to replay. */
export async function ensureIndexes(db: Db, opts: { compat?: boolean } = {}) {
  // `compat` is for tests against MongoDB-compatible servers (e.g. FerretDB) that lack TTL and partial indexes.
  // TTL only cleans up expired rows (expiry is also checked in code); the partial indexes become plain unique ones.
  const ttl = (name: string, f: Record<string, 1>) => (opts.compat ? Promise.resolve() : db.collection(name).createIndex(f, { expireAfterSeconds: 0 }));
  const uniquePartial = (name: string, field: string) =>
    db.collection(name).createIndex({ [field]: 1 }, opts.compat ? { unique: true } : { unique: true, partialFilterExpression: { [field]: { $type: "string" } } });
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    ttl("sessions", { expiresAt: 1 }),
    db.collection("sessions").createIndex({ userId: 1 }),
    ttl("password_resets", { expiresAt: 1 }),
    db.collection("institutes").createIndex({ slug: 1 }, { unique: true }),
    db.collection("institutes").createIndex({ status: 1, city: 1 }),
    db.collection("institutes").createIndex({ createdBy: 1 }),
    db.collection("institute_members").createIndex({ instituteId: 1, userId: 1 }, { unique: true }),
    db.collection("institute_members").createIndex({ userId: 1 }),
    db.collection("tutors").createIndex({ slug: 1 }, { unique: true }),
    uniquePartial("tutors", "userId"),
    db.collection("tutors").createIndex({ status: 1, city: 1 }),
    db.collection("courses").createIndex({ instituteId: 1 }),
    db.collection("faculty").createIndex({ instituteId: 1 }),
    db.collection("enquiries").createIndex({ studentId: 1, createdAt: -1 }),
    db.collection("enquiries").createIndex({ status: 1, courseKey: 1, cityKey: 1, createdAt: 1 }),
    db.collection("enquiries").createIndex({ phone: 1, courseKey: 1, createdAt: -1 }),
    db.collection("consents").createIndex({ studentId: 1, createdAt: -1 }),
    db.collection("consents").createIndex({ enquiryId: 1, purpose: 1 }),
    uniquePartial("lead_orders", "razorpayOrderId"),
    db.collection("lead_orders").createIndex({ buyerUserId: 1, createdAt: -1 }),
    // A payment id can only ever be recorded once.
    db.collection("payments").createIndex({ razorpayPaymentId: 1 }, { unique: true }),
    // A buyer can never receive the same enquiry twice.
    db.collection("allocations").createIndex({ buyerType: 1, buyerId: 1, enquiryId: 1 }, { unique: true }),
    // The two slot indexes make the per-order quantity and the per-enquiry cap structural, independent of locking.
    db.collection("allocations").createIndex({ orderId: 1, orderSlot: 1 }, { unique: true }),
    db.collection("allocations").createIndex({ enquiryId: 1, enquirySlot: 1 }, { unique: true }),
    db.collection("audit_logs").createIndex({ createdAt: -1 }),
  ]);
}
