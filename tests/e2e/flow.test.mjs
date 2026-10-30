// Browser test against a running app. BASE=http://localhost:3100 node tests/e2e/flow.test.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // preinstalled globally; or `npm i -D playwright`
import assert from "node:assert/strict";
const BASE = process.env.BASE ?? "http://localhost:3100";
const email = `stu${Date.now()}@example.com`, pw = "Passw0rdTest";
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
let n = 0; const ok = (m) => console.log(`  ok ${++n} ${m}`);
const path = () => new URL(page.url()).pathname;

// unauthenticated portal access is sent to login
await page.goto(`${BASE}/student/dashboard`); assert.equal(path(), "/login"); ok("logged-out user is redirected to /login");

// register as student
await page.goto(`${BASE}/register`);
await page.getByLabel(/student/i).first().check().catch(() => {});
await page.getByLabel(/^(full )?name/i).fill("Test Student");
await page.getByLabel(/email/i).fill(email);
await page.getByLabel(/mobile|phone/i).fill("9876543210");
await page.getByLabel(/^password/i).fill(pw);
await page.getByLabel(/terms|privacy/i).check();
await page.getByRole("button", { name: /create|register|sign up/i }).click();
await page.waitForURL(/student\/dashboard/, { timeout: 20000 }); ok("registration creates a session and opens the student portal");

// other portals are refused
for (const p of ["/admin/dashboard", "/institute/dashboard", "/tutor/dashboard"]) { await page.goto(BASE + p); assert.equal(path(), "/student/dashboard", p); }
ok("a student cannot open admin, institute or tutor portals");

// enquiry with consent
await page.goto(`${BASE}/student/enquiries/new`);
await page.getByLabel("Your name").fill("Test Student");
await page.getByLabel("Mobile number").fill("9876543210");
await page.getByLabel("City", { exact: true }).selectOption({ index: 1 });
await page.getByLabel("Course or subject").selectOption({ index: 1 });
await page.getByRole("button", { name: /save enquiry/i }).click();
await page.getByText(/agree|consent/i).first().waitFor();
assert.equal(path(), "/student/enquiries/new"); ok("submitting without the consent checkbox is blocked");
await page.getByLabel(/I agree/i).check();
await page.getByRole("button", { name: /save enquiry/i }).click();
await page.waitForURL(/student\/enquiries$/, { timeout: 20000 });
await page.getByText("Active").first().waitFor(); ok("enquiry saved with consent and listed as Active");

// consent record visible, then withdraw
await page.goto(`${BASE}/student/privacy`);
await page.getByText("Share enquiry with providers").waitFor(); ok("consent record is shown on the privacy page");
page.once("dialog", (d) => d.accept());
await page.getByRole("button", { name: /withdraw consent/i }).first().click();
await page.getByText(/Withdrawn/).first().waitFor({ timeout: 15000 }); ok("withdrawing consent updates the record");
await page.goto(`${BASE}/student/enquiries`); await page.getByText("Withdrawn").first().waitFor(); ok("enquiry now shows as Withdrawn");

// logout / login
await page.goto(`${BASE}/student/dashboard`);
await page.getByRole("button", { name: /log ?out|sign ?out/i }).first().click();
await page.waitForURL(/\/login/); ok("logout ends the session");
await page.goto(`${BASE}/student/dashboard`); assert.equal(path(), "/login"); ok("session is really gone after logout");
await page.getByLabel(/email/i).fill(email); await page.getByLabel(/password/i).fill("WrongPass1");
await page.getByRole("button", { name: /log ?in|sign ?in/i }).click();
await page.getByText("Invalid email or password.").waitFor(); ok("wrong password gives the generic error");
await page.getByLabel(/password/i).fill(pw);
await page.getByRole("button", { name: /log ?in|sign ?in/i }).click();
await page.waitForURL(/student\/dashboard/); ok("correct password logs in");

console.log(`\nE2E CHECKS PASSED (${n})  email=${email}`);
await browser.close();
