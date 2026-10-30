// Usage: MONGODB_URI=... npm run seed
// Inserts SAMPLE lead packages (is_demo = true) so checkout can be tested with Razorpay TEST keys. Safe to re-run.
// It does NOT insert fake institutes, tutors, ratings or reviews: with a database connected, listings are real or empty.
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Set MONGODB_URI first."); process.exit(1); }
const client = await new MongoClient(uri).connect();
const packages = client.db(process.env.MONGODB_DB || "edumatch").collection("lead_packages");
const rows = [
  ["institute", "Starter 10", 10, 150000], ["institute", "Growth 25", 25, 350000], ["institute", "Scale 50", 50, 650000], ["institute", "Volume 100", 100, 1200000],
  ["tutor", "Tutor 5", 5, 50000], ["tutor", "Tutor 10", 10, 90000], ["tutor", "Tutor 25", 25, 200000],
] as const;
let added = 0;
for (const [audience, name, leadsCount, pricePaise] of rows) {
  const r = await packages.updateOne({ audience, name, isDemo: true }, { $setOnInsert: { _id: randomUUID() as never, leadsCount, pricePaise, maxAgeDays: 30, active: true, createdAt: new Date() } }, { upsert: true });
  if (r.upsertedCount) added++;
}
console.log(`Sample lead packages ready (${added} added, ${rows.length - added} already existed). Prices are placeholders.`);
await client.close();
