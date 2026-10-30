import "server-only";
import { MongoClient, type Db } from "mongodb";

/** MongoDB is optional in preview mode. All data/auth code checks this first. */
export const isDbConfigured = () => Boolean(process.env.MONGODB_URI);

const g = globalThis as unknown as { __edumatchMongo?: Promise<MongoClient>; __edumatchIndexes?: Promise<void> };

async function client(): Promise<MongoClient | null> {
  const raw = process.env.MONGODB_URI;
  if (!raw || !raw.trim()) return null;
  // Tolerate stray quotes/spaces, and say what is wrong instead of an opaque parse error.
  const uri = raw.trim().replace(/^["']+|["']+$/g, "");
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    // Only the first 8 characters are shown, enough to spot "MONGODB_URI=" or a missing scheme, never the password.
    throw new Error(`MONGODB_URI must start with "mongodb+srv://" but it starts with ${JSON.stringify(uri.slice(0, 8))}. Check .env.local (one line, no spaces around "=").`);
  }
  // Cached on globalThis so dev hot-reload and serverless warm starts reuse one pool.
  g.__edumatchMongo ??= new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 }).connect();
  try {
    return await g.__edumatchMongo;
  } catch (e) {
    g.__edumatchMongo = undefined;
    throw e;
  }
}

/** Returns the database, or null when MONGODB_URI is not set. Creates indexes once per process. */
export async function getDb(): Promise<Db | null> {
  const c = await client();
  if (!c) return null;
  const db = c.db(process.env.MONGODB_DB || "edumatch");
  const { ensureIndexes } = await import("./indexes");
  g.__edumatchIndexes ??= ensureIndexes(db, { compat: process.env.MONGODB_COMPAT === "1" }).catch((e) => { g.__edumatchIndexes = undefined; throw e; });
  await g.__edumatchIndexes;
  return db;
}

export async function getMongoClient(): Promise<MongoClient | null> {
  return client();
}