import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash, type ScryptOptions } from "node:crypto";

const scrypt = (pw: string, salt: Buffer, len: number, opts: ScryptOptions) =>
  new Promise<Buffer>((res, rej) => _scrypt(pw, salt, len, opts, (e, k) => (e ? rej(e) : res(k))));

// OWASP-recommended scrypt cost (N=2^17, r=8, p=1) needs ~128MB; maxmem raised accordingly.
const N = 2 ** 15, R = 8, P = 1, KEYLEN = 64;
const opts: ScryptOptions = { N, r: R, p: P, maxmem: 128 * N * R * 2 };

/** Format: scrypt$N$r$p$salt(b64)$hash(b64). Salt is random per password. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEYLEN, opts);
  return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scrypt(password, Buffer.from(salt, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: 128 * Number(n) * Number(r) * 2 });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export const newToken = () => randomBytes(32).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
