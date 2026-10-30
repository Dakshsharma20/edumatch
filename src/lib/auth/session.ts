import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { col } from "@/lib/db/collections";
import { getDb, isDbConfigured } from "@/lib/db/mongo";
import type { AppRole } from "@/lib/db/types";
import type { Portal } from "@/lib/nav";
import { newToken, sha256 } from "./password";

export type { AppRole };

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string;
  roles: AppRole[];
}

const COOKIE = "edumatch_session";
const SESSION_DAYS = 14;

/** Creates a server-side session. Only a SHA-256 of the token is stored, so a database leak cannot be replayed as cookies. */
export async function createSession(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not configured");
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await col(db).sessions.insertOne({ _id: sha256(token), userId, expiresAt, createdAt: new Date() });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  jar.delete(COOKIE);
  if (!token) return;
  const db = await getDb();
  if (db) await col(db).sessions.deleteOne({ _id: sha256(token) });
}

/** Revoke every session of a user (used after a password reset). */
export async function destroyAllSessions(userId: string) {
  const db = await getDb();
  if (db) await col(db).sessions.deleteMany({ userId });
}

/** Resolves the signed-in user from the session cookie. Roles are read from the database on every request, never from the cookie. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isDbConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  if (!db) return null;
  const c = col(db);
  const session = await c.sessions.findOne({ _id: sha256(token) });
  if (!session || session.expiresAt < new Date()) return null;
  const user = await c.users.findOne({ _id: session.userId }, { projection: { passwordHash: 0 } });
  if (!user) return null;
  return { id: user._id, email: user.email, name: user.fullName, roles: user.roles };
}

/** Preview (unauthenticated) portals are allowed in development, or when explicitly enabled. Never silently in production. */
export function previewModeAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.EDUMATCH_PREVIEW_MODE === "true";
}

export function portalHome(roles: AppRole[]): string {
  if (roles.includes("admin")) return "/admin/dashboard";
  if (roles.includes("institute")) return "/institute/dashboard";
  if (roles.includes("tutor")) return "/tutor/dashboard";
  if (roles.includes("student")) return "/student/dashboard";
  return "/";
}

/** Only same-site relative paths are accepted for post-login redirects (prevents open redirects). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}

/**
 * Server-side authorization for a portal. Called from each portal layout.
 * - Database not configured + preview allowed: render the demo preview.
 * - Database not configured + production: refuse (never fail open).
 * - Configured: must be signed in AND hold exactly the portal's role. Admin does not imply other portals.
 */
export async function requireRole(portal: Portal): Promise<{ preview: boolean; user: CurrentUser | null }> {
  await connection(); // decide per request, never frozen into a prerendered page
  if (!isDbConfigured()) {
    if (previewModeAllowed()) return { preview: true, user: null };
    notFound();
  }
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/${portal}/dashboard`);
  if (!user.roles.includes(portal)) redirect(portalHome(user.roles));
  return { preview: false, user };
}

/** For server actions and routes that need a signed-in user with a specific role. Returns null instead of redirecting. */
export async function userWithRole(role: AppRole): Promise<CurrentUser | null> {
  const u = await getCurrentUser();
  return u && u.roles.includes(role) ? u : null;
}

export const newId = () => randomUUID();
