"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { siteConfig } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";
import { forgotSchema, loginSchema, newPasswordSchema, registerSchema, type ActionResult } from "@/lib/validation/auth";
import { hashPassword, newToken, sha256, verifyPassword } from "./password";
import { createSession, destroyAllSessions, destroySession, newId, portalHome, safeNext } from "./session";

const PREVIEW: ActionResult = {
  ok: false,
  preview: true,
  error: "The database is not configured, so nothing was saved. Set MONGODB_URI to enable real sign-in.",
};

async function clientKey(action: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${action}:${ip}`;
}

// A fixed hash to compare against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + Buffer.alloc(64).toString("base64");

export async function signIn(input: unknown, next?: string | null): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const email = parsed.data.email.trim().toLowerCase();
  if (!rateLimit(await clientKey("login"), 8, 60_000) || !rateLimit(`login-email:${email}`, 6, 5 * 60_000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }
  const db = await getDb();
  if (!db) return PREVIEW;

  const user = await col(db).users.findOne({ email });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  // One generic message: never reveal whether the email exists.
  if (!user || !ok) return { ok: false, error: "Invalid email or password." };

  await createSession(user._id);
  return { ok: true, redirectTo: safeNext(next) ?? portalHome(user.roles) };
}

export async function signUp(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (!rateLimit(await clientKey("register"), 5, 10 * 60_000)) return { ok: false, error: "Too many sign-up attempts. Please try again later." };
  const db = await getDb();
  if (!db) return PREVIEW;

  const { name, email, phone, password, role } = parsed.data; // role is zod-restricted to student|institute|tutor: admin can never be self-assigned
  const now = new Date();
  const id = newId();
  try {
    await col(db).users.insertOne({
      _id: id, email: email.trim().toLowerCase(), passwordHash: await hashPassword(password), fullName: name, phone,
      roles: [role], emailVerified: false, createdAt: now, updatedAt: now,
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return { ok: false, error: "We could not create that account. If you already registered, try logging in." };
    throw e;
  }
  await createSession(id);
  return { ok: true, redirectTo: role === "student" ? "/student/dashboard" : "/onboarding" };
}

/**
 * Password reset. There is NO email provider wired up yet, so the link cannot be delivered by email.
 * In development the link is printed to the server console. In production this returns an honest error instead of pretending.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (!rateLimit(await clientKey("reset"), 3, 10 * 60_000)) return { ok: false, error: "Too many requests. Please try again later." };
  const db = await getDb();
  if (!db) return PREVIEW;
  if (process.env.NODE_ENV === "production" && !process.env.EMAIL_API_KEY) {
    return { ok: false, error: `Password reset email is not set up yet. Please contact ${siteConfig.supportEmail}.` };
  }
  const user = await col(db).users.findOne({ email: parsed.data.email.trim().toLowerCase() }, { projection: { _id: 1 } });
  if (user) {
    const token = newToken();
    await col(db).passwordResets.insertOne({ _id: sha256(token), userId: user._id, expiresAt: new Date(Date.now() + 3_600_000), createdAt: new Date() });
    const link = `${siteConfig.url}/reset-password?token=${token}`;
    if (process.env.NODE_ENV !== "production") console.log(`[dev only] Password reset link for ${parsed.data.email}: ${link}`);
    // TODO(email provider): send `link` by email here.
  }
  // Same response whether or not the account exists.
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(input: unknown): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const db = await getDb();
  if (!db) return PREVIEW;
  // Atomic: a reset token can be used exactly once.
  const used = await col(db).passwordResets.findOneAndDelete({ _id: sha256(parsed.data.token), expiresAt: { $gt: new Date() } });
  if (!used) return { ok: false, error: "This reset link has expired or was already used. Request a new one." };
  await col(db).users.updateOne({ _id: used.userId }, { $set: { passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date() } });
  await destroyAllSessions(used.userId); // sign out everywhere
  return { ok: true, message: "Password updated. Please log in.", redirectTo: "/login" };
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}
