// Usage: MONGODB_URI=... node --experimental-strip-types scripts/make-admin.mts you@example.com
// Admin can never be self-assigned through the app. Run this once, from a trusted machine, after the person has registered.
import { MongoClient } from "mongodb";

const email = process.argv[2]?.trim().toLowerCase();
const uri = process.env.MONGODB_URI;
if (!email || !uri) { console.error("Usage: MONGODB_URI=... node --experimental-strip-types scripts/make-admin.mts <email>"); process.exit(1); }
const client = await new MongoClient(uri).connect();
const res = await client.db(process.env.MONGODB_DB || "edumatch").collection("users").updateOne({ email }, { $addToSet: { roles: "admin" } });
console.log(res.matchedCount ? `OK: ${email} is now an admin.` : `No user found with email ${email}. Register first.`);
await client.close();
