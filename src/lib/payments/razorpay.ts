import "server-only";

/**
 * Minimal Razorpay REST client (orders + fetch payment). Uses fetch and Basic auth with the key secret, which never
 * leaves the server. Signature checks live in ./signature.ts. Keys come from env only.
 */
const BASE = "https://api.razorpay.com/v1";

export function getRazorpayConfig() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export const isRazorpayConfigured = () => getRazorpayConfig() !== null;

async function rz<T>(path: string, init?: RequestInit): Promise<T> {
  const cfg = getRazorpayConfig();
  if (!cfg) throw new Error("Razorpay is not configured");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64")}`,
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay ${path} failed with status ${res.status}`);
  return (await res.json()) as T;
}

export interface RazorpayOrder { id: string; amount: number; currency: string; status: string }
export interface RazorpayPayment { id: string; order_id: string | null; amount: number; currency: string; status: string }

export const createRazorpayOrder = (amountPaise: number, receipt: string, notes: Record<string, string>) =>
  rz<RazorpayOrder>("/orders", {
    method: "POST",
    // payment_capture=1: captured automatically, so a webhook/`captured` status is the success signal.
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes, payment_capture: 1 }),
  });

export const fetchRazorpayPayment = (paymentId: string) =>
  rz<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
