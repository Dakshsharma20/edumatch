"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentUser, newId } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { markOrderPaid } from "./engine";
import { createRazorpayOrder, fetchRazorpayPayment, getRazorpayConfig } from "@/lib/payments/razorpay";
import { signDownloadToken, verifyCheckoutSignature } from "@/lib/payments/signature";
import { rateLimit } from "@/lib/rate-limit";
import { createOrderSchema, verifyPaymentSchema } from "@/lib/validation/leads";

export type LeadResult<T = object> = ({ ok: true } & T) | { ok: false; error: string; preview?: boolean };

const fail = (error: string, preview = false): { ok: false; error: string; preview?: boolean } => ({ ok: false, error, preview });

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

/** Resolve which institute/tutor the signed-in user buys for. Only APPROVED (published) listings may buy leads. */
type Buyer = { error: string; type?: undefined; id?: undefined } | { error?: undefined; type: "institute" | "tutor"; id: string };
async function resolveBuyer(db: Db, userId: string, roles: string[]): Promise<Buyer> {
  const c = col(db);
  if (roles.includes("institute")) {
    const m = await c.instituteMembers.findOne({ userId, memberRole: { $in: ["owner", "manager"] } });
    if (!m) return { error: "Complete institute onboarding first." };
    const inst = await c.institutes.findOne({ _id: m.instituteId }, { projection: { status: 1 } });
    if (inst?.status !== "published") return { error: "Your institute must be approved before you can buy enquiries." };
    return { type: "institute", id: inst._id };
  }
  if (roles.includes("tutor")) {
    const t = await c.tutors.findOne({ userId }, { projection: { status: 1 } });
    if (!t) return { error: "Create your tutor profile first." };
    if (t.status !== "published") return { error: "Your tutor profile must be approved before you can buy enquiries." };
    return { type: "tutor", id: t._id };
  }
  return { error: "Only institutes and tutors can buy enquiries." };
}

/**
 * Step 1: create the order. The AMOUNT always comes from the package row in the database, never from the client.
 * Orders are written with the service role because users have no INSERT permission on lead_orders.
 */
export async function createLeadOrder(input: unknown): Promise<LeadResult<{ razorpayOrderId: string; amountPaise: number; keyId: string; description: string }>> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const rz = getRazorpayConfig();
  const db = await getDb();
  if (!rz || !db) return fail("Payments are not configured. Razorpay keys and MONGODB_URI are required (use Razorpay TEST keys first).", true);

  const user = await getCurrentUser();
  if (!user) return fail("Please log in first.");
  const h = await headers();
  if (!rateLimit(`order:${user.id}:${h.get("x-forwarded-for") ?? ""}`, 10, 10 * 60_000)) return fail("Too many attempts. Please wait and try again.");

  const buyer = await resolveBuyer(db, user.id, user.roles);
  if (buyer.error !== undefined) return fail(buyer.error);

  // The amount ALWAYS comes from the package row in the database, never from the client.
  const pkg = await col(db).leadPackages.findOne({ _id: parsed.data.packageId, active: true });
  if (!pkg) return fail("That package is not available.");
  if (pkg.audience !== buyer.type) return fail("That package is not available for your account type.");

  let rzOrder;
  try {
    rzOrder = await createRazorpayOrder(pkg.pricePaise, `lead_${Date.now()}`, { buyer_type: buyer.type, buyer_id: buyer.id, package_id: pkg._id });
  } catch {
    return fail("Could not start the payment. Please try again.");
  }
  if (rzOrder.amount !== pkg.pricePaise) return fail("Payment amount mismatch. Please try again.");

  try {
    await col(db).leadOrders.insertOne({
      _id: newId(), buyerType: buyer.type, buyerId: buyer.id, buyerUserId: user.id, packageId: pkg._id, quantity: pkg.leadsCount, amountPaise: pkg.pricePaise,
      criteria: { course: parsed.data.course, city: parsed.data.city, ...(parsed.data.mode ? { mode: parsed.data.mode } : {}) },
      maxAgeDays: pkg.maxAgeDays, status: "created", razorpayOrderId: rzOrder.id, allocatedCount: 0, createdAt: new Date(),
    });
  } catch {
    return fail("Could not record your order. You have not been charged. Please try again.");
  }
  return { ok: true, razorpayOrderId: rzOrder.id, amountPaise: pkg.pricePaise, keyId: rz.keyId, description: `${pkg.name}: ${pkg.leadsCount} enquiries${pkg.isDemo ? " (sample package)" : ""}` };
}

/**
 * Step 2: after Razorpay Checkout returns. We never trust the browser's "success". We (a) verify the signature,
 * (b) fetch the payment from Razorpay and check order, amount and status, and only then (c) ask the database to
 * mark the order paid and allocate. The webhook is the independent second path; the DB function is idempotent.
 */
export async function verifyLeadPayment(input: unknown): Promise<LeadResult<{ status: "fulfilled" | "processing" }>> {
  const parsed = verifyPaymentSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid payment response.");
  const rz = getRazorpayConfig();
  const db = await getDb();
  if (!rz || !db) return fail("Payments are not configured.", true);
  const user = await getCurrentUser();
  if (!user) return fail("Please log in first.");

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;
  // Only the buyer's own orders are visible here.
  const order = await col(db).leadOrders.findOne({ razorpayOrderId, buyerUserId: user.id }, { projection: { amountPaise: 1 } });
  if (!order) return fail("Order not found.");

  if (!verifyCheckoutSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, rz.keySecret)) return fail("Payment signature could not be verified.");

  let payment;
  try { payment = await fetchRazorpayPayment(razorpayPaymentId); } catch { return fail("Could not confirm the payment with Razorpay. If you were charged, your enquiries will appear shortly."); }
  if (payment.order_id !== razorpayOrderId || payment.amount !== order.amountPaise || payment.currency !== "INR") return fail("Payment details did not match the order.");
  if (payment.status !== "captured") return { ok: true, status: "processing" }; // webhook will finish it

  let applied: string | null = null;
  try { applied = await markOrderPaid(db, razorpayOrderId, razorpayPaymentId, payment.amount, "checkout_verified"); } catch { /* handled below */ }
  if (!applied) return fail("Payment received but could not be applied automatically. Our team has been flagged; you will not be charged twice.");

  revalidatePath("/institute/leads"); revalidatePath("/tutor/leads");
  return { ok: true, status: "fulfilled" };
}

/** Short-lived (15 min) signed download link for the buyer's own order. The route re-checks the session and that the order belongs to the user. */
export async function getLeadDownloadLink(orderId: string): Promise<LeadResult<{ url: string }>> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return fail("Invalid order.");
  const secret = process.env.LEAD_EXPORT_SECRET;
  const db = await getDb();
  if (!secret || !db) return fail("Exports are not configured.", true);
  const user = await getCurrentUser();
  if (!user) return fail("Please log in first.");
  const order = await col(db).leadOrders.findOne({ _id: orderId, buyerUserId: user.id }, { projection: { status: 1 } });
  if (!order || !["fulfilled", "partially_fulfilled"].includes(order.status)) return fail("No leads available for this order.");
  const token = signDownloadToken({ o: orderId, u: user.id, exp: Math.floor(Date.now() / 1000) + 15 * 60 }, secret);
  return { ok: true, url: `/api/leads/download?token=${encodeURIComponent(token)}` };
}
