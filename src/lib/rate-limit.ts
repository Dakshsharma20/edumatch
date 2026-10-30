import "server-only";

/**
 * Best-effort in-memory limiter for sensitive actions (login, register, reset).
 * It is per server instance only, so on serverless it slows casual abuse but is NOT a hard guarantee.
 * This in-memory limiter is per-instance only; add a shared store
 * (e.g. Upstash Redis) before launch for consistent limits.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  return true;
}
