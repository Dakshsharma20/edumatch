// Pure crypto/CSV helpers (no framework imports) so they can be unit-tested with plain Node.
import { createHmac, timingSafeEqual } from "node:crypto";

export const hmacHex = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("hex");

/** Constant-time comparison of two hex strings. Different lengths or non-hex input simply return false. */
export function safeEqualHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b) || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/** Razorpay Checkout: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, keySecret: string) {
  return safeEqualHex(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

/** Razorpay webhook: HMAC_SHA256(raw request body, webhook_secret). Must use the RAW body, never re-serialised JSON. */
export function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string) {
  return safeEqualHex(hmacHex(webhookSecret, rawBody), signature);
}

/* ---------- expiring, signed download tokens ---------- */
export interface DownloadClaims { o: string; u: string; exp: number } // order id, user id, expiry (unix seconds)

export function signDownloadToken(claims: DownloadClaims, secret: string): string {
  const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${body}.${hmacHex(secret, body)}`;
}

export function verifyDownloadToken(token: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): DownloadClaims | null {
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined || !safeEqualHex(hmacHex(secret, body), sig)) return null;
  try {
    const c = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as DownloadClaims;
    if (typeof c.o !== "string" || typeof c.u !== "string" || typeof c.exp !== "number" || c.exp < nowSeconds) return null;
    return c;
  } catch {
    return null;
  }
}

/* ---------- CSV (RFC 4180 + spreadsheet formula-injection guard) ---------- */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  // A cell starting with = + - @ (or tab/CR) can execute as a formula in Excel/Sheets: neutralise with a leading quote.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
