import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { verifyCheckoutSignature, verifyWebhookSignature, signDownloadToken, verifyDownloadToken, toCsv, csvCell, safeEqualHex } from "../../src/lib/payments/signature.ts";
const ssl = (key: string, data: string) => execFileSync("openssl", ["dgst", "-sha256", "-hmac", key, "-hex"], { input: data }).toString().trim().split(" ").pop()!;

// independent HMAC from openssl
const good = ssl("test_secret", "order_123|pay_456");
assert.equal(verifyCheckoutSignature("order_123", "pay_456", good, "test_secret"), true);
assert.equal(verifyCheckoutSignature("order_123", "pay_999", good, "test_secret"), false, "wrong payment id");
assert.equal(verifyCheckoutSignature("order_123", "pay_456", good, "other_secret"), false, "wrong secret");
assert.equal(verifyCheckoutSignature("order_123", "pay_456", good.slice(0, -2) + "00", "test_secret"), false, "tampered signature");
assert.equal(verifyCheckoutSignature("order_123", "pay_456", "", "test_secret"), false, "empty signature");
assert.equal(verifyCheckoutSignature("order_123", "pay_456", "zz".repeat(32), "test_secret"), false, "non-hex");

const body = '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_1"}}}}';
const wsig = ssl("whsec", body);
assert.equal(verifyWebhookSignature(body, wsig, "whsec"), true);
assert.equal(verifyWebhookSignature(body + " ", wsig, "whsec"), false, "body altered by one byte");
assert.equal(verifyWebhookSignature(JSON.stringify(JSON.parse(body), null, 2), wsig, "whsec"), false, "re-serialised body must fail (raw body required)");

// tokens
const now = 1_000_000;
const tok = signDownloadToken({ o: "ord", u: "usr", exp: now + 900 }, "k");
assert.deepEqual(verifyDownloadToken(tok, "k", now), { o: "ord", u: "usr", exp: now + 900 });
assert.equal(verifyDownloadToken(tok, "k", now + 901), null, "expired");
assert.equal(verifyDownloadToken(tok, "other", now), null, "wrong key");
const [b, s] = tok.split(".");
const forged = Buffer.from(JSON.stringify({ o: "ord", u: "attacker", exp: now + 900 })).toString("base64url");
assert.equal(verifyDownloadToken(`${forged}.${s}`, "k", now), null, "payload swapped");
assert.equal(verifyDownloadToken(`${b}.${s}.x`, "k", now), null, "extra segment");
assert.equal(verifyDownloadToken("garbage", "k", now), null);

// csv
assert.equal(csvCell("=HYPERLINK(\"http://x\")"), `"'=HYPERLINK(""http://x"")"`);
assert.equal(csvCell("+91 98765"), "'+91 98765");
assert.equal(csvCell("@SUM(1)"), "'@SUM(1)");
assert.equal(csvCell("a,b"), '"a,b"');
assert.equal(csvCell(null), "");
assert.equal(toCsv(["n", "c"], [["A", "x\ny"]]), 'n,c\r\nA,"x\ny"\r\n');
assert.equal(safeEqualHex("ab", "abc"), false);
console.log("signature/token/csv tests passed");
