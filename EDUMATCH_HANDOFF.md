# EduMatch: Project Handoff

Written 2026-10-29 for continuing in Claude Code (VS Code). Everything here comes from the build conversation. Where something was **not verified**, it says so. Nothing is assumed.

---

## 1. Project requirements and goals

**What:** "EduMatch" (temporary, configurable name via `NEXT_PUBLIC_APP_NAME`): an AI-ready coaching-institute and personal-tutor marketplace for **India** (INR ₹, Indian locations, 10-digit Indian mobile validation `^[6-9]\d{9}$` with optional `+91`/`0`, Razorpay).

**Four portals:** Student/Parent, Coaching Institute, Personal Tutor, Admin. Mobile-first, accessible, SEO-friendly.

**Revenue:** subscriptions, consent-based student leads, sponsored listings, premium features.

**Design:** serious, established Indian SaaS look. Deep indigo primary, teal secondary, white/light-grey background, dark-slate text, green/amber/red status. Rounded cards, subtle borders, sparing shadows, no gimmicky gradients.

**Mandated stack:** Next.js App Router, TypeScript, Tailwind, shadcn/ui, Lucide, Supabase (Postgres, Auth, Storage), React Hook Form + Zod, Recharts, Razorpay (server-side verification + webhooks), a transactional email service (not chosen yet).

**Non-negotiable rules from the brief (paraphrased):**
- No secrets in frontend code. Server-side authorization **and** Supabase RLS. Admin checks server-side, audit trail for sensitive admin actions.
- Never invent verification, ratings, reviews, qualifications or success stats. Sample data must be clearly labelled demo. No "verified" unless checks actually happened.
- Consent: explicit, purpose-specific, recorded with timestamp + policy version; guardian consent for under-18; marketing consent separate and off by default; withdrawal and deletion workflows; no unrestricted bulk exports.
- Payments: server-verified only, idempotent, no card data stored, no allocation on a frontend success message, no fake payment verification. If no credentials, a clearly labelled test flow, not pretend payments.
- Don't expose all students to institutes; institutes see only leads shared with them; tutors never see other tutors' private data.
- Every visible button has a real action or a clearly labelled disabled state. Don't claim a feature is complete if it isn't; distinguish implemented from placeholder.
- Include README, `.env.example`, migrations, RLS policies, seed scripts. Don't put the app in a single file.

**Required routes (from brief):** public `/`, `/find-coaching`, `/find-tutors`, `/compare`, `/coaching/[slug]`, `/tutor/[slug]`, `/how-it-works`, `/for-institutes`, `/for-tutors`, `/pricing`, `/contact`, `/privacy`, `/terms`; auth `/login /register /forgot-password /onboarding`; `/student/*`, `/institute/*`, `/tutor/*`, `/admin/*` portals. (We deviated on one: see decision D1.)

**Staged plan from the brief:**
1. Foundation + UI. 2. Backend (Supabase auth, roles, migrations/RLS, registration, course mgmt, search, favourites, comparison). 3. Lead marketplace (enquiry + consent, eligibility, packages, Razorpay, allocation, CSV/XLSX export, email). 4. Demo bookings, reviews + moderation, analytics, subscriptions, AI (study-match, profile assistant, explainable comparison), privacy requests. 5. Testing (roles, unauthorized access, onboarding, search/compare, consent withdrawal, payment failures, duplicate webhooks, duplicate allocation, secure exports, responsiveness, validation, empty/error states).

**AI features (Stage 4 design intent):** study-match assistant over real DB rows with "why it matches" and an honest "no match" answer; profile-improvement assistant (never fabricates reviews/qualifications/rankings); explainable comparison from verified fields; advertising must never silently alter organic comparison/ranking.

**Data entities listed in the brief:** users, user_roles, student_profiles, parent_guardian_records, institutes, institute_members, institute_verification_documents, tutors, tutor_verification_documents, courses, batches, faculty, course_faculty, institute_reviews, tutor_reviews, favourites, comparison_lists, enquiries, enquiry_recipients, consent_records, demo_bookings, lead_packages, lead_orders, lead_allocations, subscriptions, payment_transactions, invoices, notifications, complaints, privacy_requests, audit_logs, sponsored_listings.

---

## 2. Architecture and tech stack

**Location:** project folder `edumatch/` (was built in a cloud sandbox at `/home/claude/edumatch`; you have it as a zip).

**Installed versions (from `package.json`):** next ^16.4.3, react / react-dom ^19.3.1, tailwindcss + @tailwindcss/postcss ^4.3.3, typescript ^5.9.3 (deliberately 5.x, see D6), @types/node ^22, lucide-react ^1.62.0, recharts ^3.10.1, zod ^4.6.7, react-hook-form ^7.91.0, **@hookform/resolvers ^5.9.2** (see D6), class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot, @supabase/supabase-js, @supabase/ssr, server-only. Node 20.9+ required (built on Node 22).

**shadcn/ui:** primitives are hand-written in the shadcn pattern (cva + `cn`) under `src/components/ui`; `components.json` is included so `npx shadcn add <component>` works. The shadcn CLI itself was never run.

**Next 16 notes:** `src/proxy.ts` replaces `middleware.ts` (refreshes the Supabase session cookie only, not the authorization boundary). Tailwind 4 uses `@import "tailwindcss"` and an `@theme` block in `src/app/globals.css` (no `tailwind.config`). `searchParams`/`params` are Promises.

**Layout:**
```
src/app/(public)        marketing, search, listing detail, compare
src/app/(auth)          login, register, forgot-password, reset-password, onboarding
src/app/(student|institute|tutor|admin)/<portal>/   layout.tsx (calls PortalLayout), dashboard/, [section]/ placeholders, specific pages
src/app/auth/callback   PKCE code exchange route (email confirm + password recovery)
src/components/ui       Button, Card, Badge, form-controls, Table, Modal (native <dialog>), feedback (Skeleton, EmptyState, DemoNotice, StatusBanner)
src/components/{layout,listing,search,marketing,dashboard,charts,onboarding,auth}
src/lib/config.ts       siteConfig (brand name, URL, support email, policyVersion "draft-0.1")
src/lib/data/           listings.ts (data layer), mappers.ts (DB row -> types)
src/lib/demo/           FICTIONAL data: listings, pricing, dashboard metrics
src/lib/supabase/       env.ts, server.ts (cookie client), public.ts (anon cookie-less), admin.ts (service-role, server-only)
src/lib/auth/           session.ts (getCurrentUser, requireRole, portalHome, safeNext), actions.ts
src/lib/institute/actions.ts, src/lib/admin/actions.ts
src/lib/validation/     auth.ts, institute.ts (shared by client forms and server actions)
src/lib/{nav.ts, search-params.ts, rate-limit.ts, utils.ts}
src/hooks/use-local-list.ts
src/types/index.ts
supabase/migrations/    0001..0005 (0005 untested, see section 7)
supabase/tests/         stub_supabase.sql, rls_test.sql
supabase/seed.sql
```

**Auth/authorization model:** Supabase Auth; roles in `public.user_roles`; `requireRole(portal)` runs server-side in each portal layout (calls `connection()` so it is never prerendered). Admin does **not** imply other portals. Without Supabase configured: portals are demo previews in development, **404 in production** unless `EDUMATCH_PREVIEW_MODE=true`.

**Data flow:** public pages read published rows via the cookie-less anon client (RLS enforced) when Supabase is configured, otherwise labelled demo data. `isDemo` on each record drives badges/notices/noindex.

**Env vars (`.env.example`):** `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (server only), `EMAIL_API_KEY`, `EMAIL_FROM`, `EDUMATCH_PREVIEW_MODE=false`. **Planned but not yet added:** `LEAD_EXPORT_SECRET` (signing key for expiring download links).

---

## 3. Features implemented

### Stage 1 (UI), complete, build-verified
- **Design system:** Button/Card/Badge/inputs/Table/Modal/Skeleton/EmptyState/DemoNotice/StatusBanner, tokens in `globals.css`, skip-link, focus styles, reduced-motion.
- **Public site:** homepage (hero with tabbed coaching/tutor search form, categories, popular exams, featured institutes, recommended tutors, comparison section, how it works, three audience blocks, trust section, FAQ), `/find-coaching`, `/find-tutors` (URL-driven filters, active chips, sort, pagination, empty state, `loading.tsx` skeletons, mobile filter drawer), institute detail (gallery placeholder, verified-vs-"Provider-supplied" tags, courses/fee breakdown/timings, faculty, facilities, refund policy, empty reviews state, JSON-LD, demo records `noindex`), tutor detail, `/compare` (up to 4, responsive table, "Not provided" for gaps, add/remove), `/how-it-works`, `/for-institutes`, `/for-tutors`, `/pricing` (sample prices), `/contact`, `/privacy` + `/terms` (draft outlines, **need legal review**), sitemap, robots, error and not-found pages.
- **Request dialogs** (callback, demo, contact-sharing, report): Indian-mobile validation, purpose-specific consent text, separate unchecked marketing box, under-18 guardian check. **They validate only; nothing is sent or stored.**
- **Compare/favourites** persist in `localStorage` (hook `use-local-list`), not DB.
- **Dashboards for all 4 roles:** shell with role nav (from `src/lib/nav.ts`), stat cards, Recharts charts (sample data), institute CRM table preview (masked sample numbers), lead-package picker preview (checkout button disabled), student preferences form (saved to localStorage), admin queue preview. Every unbuilt nav item renders a "Not implemented yet, planned for Stage N" page via `SectionPage`.
- **Onboarding wizard:** 8 steps, progress bar, per-step validation, device-local draft.

### Stage 2 (backend), partly done
- Migrations 0001-0004 + RLS + seed + SQL test suite (see section 5). **Tested on plain Postgres 16 with a Supabase stub; never run on a live Supabase project.**
- Auth server actions: sign in (generic error message), sign up (role from signup metadata, only student/institute/tutor honoured), password reset request, update password, sign out; `/auth/callback`; `/reset-password`; best-effort in-memory rate limiting; Zod schemas shared client/server; safe `next` redirects.
- `requireRole` wired into every portal layout; sign-out button in the shell. **Verified without Supabase:** production build returns 404 for portals by default and 200 only with `EDUMATCH_PREVIEW_MODE=true`.
- Listings data layer reads Supabase when configured (with embedded courses/batches/faculty), mappers, sitemap includes published non-demo listings.
- Institute onboarding now persists via `submitInstituteApplication`: draft institute → private contacts → faculty → first (unpublished) course + batch → status `submitted`. Never sets verification.
- `/institute/courses`: create course, publish/unpublish (`saveCourse`, `setCoursePublished`, scoped by institute server-side and by RLS).
- `/admin/verifications`: real queue of `submitted` institutes with Approve/Reject (`decideInstitute`), server admin check, writes audit log through `log_admin_action`. Approve = publish + mark Verified.

*Everything in the two bullets above that touches the app (not the SQL) was typechecked and built, not exercised against a live Supabase.*

---

## 4. Features still pending

**Stage 2 leftovers:** tutor onboarding + tutor profile persistence + tutor verification screen; faculty management screen; verification-document upload UI and signed-link viewing (admin currently must check documents out-of-band); favourites and comparison lists in the DB (still localStorage); student profile saved to `student_profiles` (still localStorage); institute profile editor; SQL-side search (filters currently run in memory); locality/distance/rating filters (shown disabled).

**Stage 3 (lead marketplace), in progress:** see section 8. Nothing beyond migration 0005 (untested) exists. Missing: student enquiry form + consent UI, withdraw-consent UI, guardian flow UI, lead eligibility UI, real package picker, Razorpay order/verify/webhook, allocation trigger from app, CSV/XLSX export + expiring links, purchased-leads pages, transactional email, invoices, refunds, admin package/price management, admin lead inventory/orders/payments pages.

**Stage 4:** demo bookings, reviews + moderation, analytics from real data (charts currently sample), subscriptions (institute monthly/annual, tutor), sponsored listings (labelled, no effect on organic ranking), AI study-match / profile assistant / explainable comparison, notifications, complaints, privacy-request management, FAQ table (institute FAQs currently always empty from DB).

**Stage 5:** automated tests (none besides the SQL RLS tests), responsive checks on real devices/browsers, accessibility pass, empty/error-state review.

**Other unbuilt items from the brief:** `/student/comparisons|favourites|enquiries|bookings|privacy` real pages, admin pages beyond overview + verifications, AI hooks, XLSX export, email, legal review of privacy/terms, India data-protection compliance review ("obtain legal review before launch").

---

## 5. Database schema and Supabase configuration

**Status:** no Supabase project has been created or connected. The user was asked for a project URL + anon key and had not provided them at the time of this handoff.

### Migrations (apply in order)
| File | Contents | Tested? |
|---|---|---|
| `0001_core_schema.sql` | enums (`app_role`, `listing_status`, `verification_status`, `teaching_mode`, `member_role`, `document_status`, `favourite_type`); tables `profiles`, `user_roles`, `student_profiles`, `institutes`, `institute_members`, `institute_verification_documents`, `tutors`, `tutor_verification_documents`, `courses`, `batches`, `faculty`, `course_faculty`, `favourites`, `comparison_lists`, `audit_logs`; helper fns `has_role`, `is_admin`, `is_institute_member`, `log_admin_action`; triggers (`handle_new_user`, `add_institute_owner`, `guard_listing_moderation`, `audit_logs_immutable`, updated_at) | Yes (local PG 16 + stub) |
| `0002_rls.sql` | RLS enabled on all tables, deny-by-default grants, policies | Yes |
| `0003_storage.sql` | private `verification-docs` bucket (5 MB, pdf/jpeg/png) + storage policies keyed on `<institute-or-tutor-uuid>/<file>` paths | **No** (needs real `storage` schema; stub only has minimal tables, and policies were applied but behaviour not tested) |
| `0004_institute_private.sql` | `institute_private` (contact person/email/phone/state), RLS owner/manager/admin | Yes |
| `0005_leads_payments.sql` | see below | **NO. Written, never applied or tested** |

### Key behaviours (0001-0004, tested)
- `handle_new_user` trigger on `auth.users`: creates profile + exactly one role from signup metadata (`student` default, `institute`, `tutor`; **never `admin`**) and a `student_profiles` row for students. Admins are assigned manually: `insert into public.user_roles (user_id, role) values ('<uuid>', 'admin');`
- `guard_listing_moderation` trigger: non-admins cannot change `verification` or `is_demo`; status transitions limited to draft/rejected → submitted and submitted → draft. Service role / no-JWT sessions are unrestricted.
- Anon/public can read only `status = 'published'` institutes/tutors and only published courses/batches/faculty of published institutes. Verification documents, `institute_private`, student data are never public.
- Admins cannot browse `student_profiles` through the API (deliberate).
- `audit_logs` append-only (trigger), written only via `log_admin_action` (admin-only SECURITY DEFINER) or SECURITY DEFINER functions.
- Roles are read-only for users; only service role / migrations assign them.
- `comparison_lists.institute_ids` capped at 4 by a CHECK.

### Tests
`supabase/tests/rls_test.sql` + `stub_supabase.sql` (fake `auth.users`, `auth.uid()`, `storage` stubs, roles `anon`/`authenticated`). Run order: `createdb t && psql t -f supabase/tests/stub_supabase.sql -f supabase/migrations/0001_core_schema.sql -f supabase/migrations/0002_rls.sql -f supabase/migrations/0003_storage.sql -f supabase/migrations/0004_institute_private.sql -f supabase/tests/rls_test.sql`. Last run: it printed `ALL RLS CHECKS PASSED`, `INSTITUTE_PRIVATE CHECKS PASSED`, `ONBOARDING WRITE CHECKS PASSED`. (Covers: admin self-grant ignored, student isolation, institute lifecycle, cross-institute denial for courses/docs/members/faculty/contact, anon visibility, audit immutability, tutor isolation.) The README run command omits 0004; use the list above.

### `0005_leads_payments.sql` (written, UNTESTED)
Intended design:
- Enums `enquiry_status` (valid/withdrawn/deleted), `consent_purpose` (lead_marketplace/direct_contact/marketing), `buyer_type` (institute/tutor), `order_status` (created/paid/fulfilled/partially_fulfilled/failed/refunded).
- Tables: `guardian_records` (declared, `verified` defaults false: it records a declaration, not verified consent), `enquiries` (private student data; CHECK minor ⇒ guardian_id; duplicate trigger flags same phone + course within 30 days into `duplicate_of`), `consent_records` (stores the exact `disclosure_text`, `policy_version`, `withdrawn_at`), `lead_packages` (`price_paise`, `max_age_days`, `is_demo`), `lead_orders` (`razorpay_order_id` unique, `criteria` jsonb, `allocated_count`), `payment_transactions` (`razorpay_payment_id` unique = payment idempotency key), `webhook_events` (`event_id` PK = webhook idempotency), `lead_allocations` (unique per buyer+enquiry so a buyer never pays twice for a lead).
- SECURITY DEFINER, service_role-only functions: `fulfill_order(order)` (locks order, only acts when `paid`, picks eligible enquiries with `FOR UPDATE ... SKIP LOCKED`, max 3 buyers per lead, allocates, marks fulfilled or partially_fulfilled), `mark_order_paid(rzp_order, rzp_payment, amount_paise, source)` (idempotent, records txn, rejects amount mismatch with NULL, then fulfils), `mark_order_failed`. `withdraw_enquiry(id)` is callable by students (sets enquiry withdrawn, stamps consent withdrawn, writes audit).
- RLS: students own their enquiries/consent/guardians; buyers can read an enquiry only if allocated to them **and** `status = 'valid'` (so withdrawal removes buyer access); orders/allocations/transactions readable by owner/admin only; users cannot write orders, transactions or allocations.
- Column-level INSERT grant on `enquiries` so users cannot set `status` or `duplicate_of`.
- **Known to need attention when testing:** the stub has no `service_role` role (add it, the migration grants conditionally via a `DO` block); eligibility is exact-match (lower-cased) on course and city; the "max 3 buyers" check relies on row locks and should be concurrency-tested; no seed packages written yet.

### Supabase project setup (not done)
1. Create project. 2. Apply migrations 0001-0005 in order (SQL editor or `supabase db push`); optionally `seed.sql` (dev only; all rows `is_demo = true`, published, never verified). 3. Set the three Supabase env vars in `.env.local`. 4. Auth settings: email confirmation behaviour affects the signup flow (the code handles "no session yet → check your email"); set redirect URLs to `<SITE_URL>/auth/callback`. 5. Assign admin(s) manually (above). 6. Storage bucket comes from 0003.

---

## 6. Important technical decisions

- **D1. Tutor public route is `/tutors/[slug]`** (not `/tutor/[slug]`) to avoid colliding with the tutor portal at `/tutor/*`. Brief explicitly allowed route adjustments.
- **D2. Fail-closed portals.** No Supabase + production ⇒ 404. Preview only in dev or explicit `EDUMATCH_PREVIEW_MODE=true`. `requireRole` calls `connection()` because otherwise Next prerendered the portal at build time and froze the decision (this was a real bug we hit and fixed).
- **D3. Auth is enforced in the DB and on the server, UI hiding is never the control.** Server actions re-validate with the same Zod schemas and re-check role; RLS is the backstop; actions also scope writes with `.eq("institute_id", ...)`.
- **D4. Service-role client is isolated** in `src/lib/supabase/admin.ts` (`server-only`). Plan: use it only for webhooks and order creation after explicit checks.
- **D5. Honesty rules encoded in data:** `rating` is always `null` until reviews exist; `verification` defaults `not_verified`; only an admin (trigger-enforced) can set verified/demo flags; demo records are `noindex` and excluded from the sitemap; "Provider-supplied" tags vs "Verified" tags; missing comparison data shows "Not provided".
- **D6. Dependency choices:** TypeScript pinned to 5.x although 7.x exists; `@hookform/resolvers` pinned to v5 because v6 had a peer-dependency conflict (`effect`) under npm.
- **D7. Public reads use a cookie-less anon client** so pages work at build time and stay cacheable; session client (`createClient`) is used for private data.
- **D8. Roles come from signup metadata through a trigger** that can only grant student/institute/tutor.
- **D9. Institute private contacts live in `institute_private`**, not on the public `institutes` table.
- **D10. Approve = publish + Verified** in the admin action; the UI warns to approve only after reviewing documents.
- **D11. Filters/sort run in memory** over published rows (fine at small scale; move to SQL with indexes before the catalogue grows).
- **D12. Rate limiter is in-memory per instance** (best effort); Supabase Auth limits are the real backstop. A shared store (e.g. Redis) is needed before launch.
- **D13. Money in paise** (`price_paise`, `amount_paise`) in the DB.
- **Planned Stage 3 decisions (not yet implemented):** enquiries require a signed-in student; call Razorpay via `fetch` + Node `crypto` HMAC (SHA-256, `timingSafeEqual`) instead of the SDK; after checkout the server fetches the payment from Razorpay and checks status/order/amount before calling `mark_order_paid`; the webhook route verifies `X-Razorpay-Signature` against the raw body and dedupes on `x-razorpay-event-id`; if Razorpay keys are missing, return a clear "not configured" error (no simulated payments, which would violate the brief); CSV generated server-side with CSV-injection guarding (prefix `'` for `= + - @`) and delivered via an HMAC-signed, expiring link; no unrestricted attachments in email; partial fulfilment allowed, shortfall handled by an admin credit process.

---

## 7. Bugs, errors, and unresolved issues

**Fixed during the build (for context):**
- npm peer conflict with `@hookform/resolvers@6`, fixed by pinning v5.
- Portal pages were prerendered at build and ignored `EDUMATCH_PREVIEW_MODE`, fixed with `connection()`.
- Test-script mistakes (not policy bugs): insert-select seeing zero rows; `UPDATE ... RETURNING` inside a subquery; expecting "0 rows" where anon is correctly denied outright.
- A few TypeScript typing issues in the actions' `context()` helper, fixed.

**Unresolved / not verified (be aware):**
1. **Nothing has run against a live Supabase project.** Auth flows, redirects, session refresh via `proxy.ts`, server actions (onboarding, courses, admin decisions), `/auth/callback`, and the Supabase-backed listings path have only been typechecked and built.
2. **`0005_leads_payments.sql` has never been applied to any database.** It may contain SQL errors. The stub needs a `service_role` role added.
3. **`0003_storage.sql` policies are untested** (and casting folder names to `uuid` will error for non-UUID paths, which effectively denies them).
4. **The delivered `edumatch.zip` predates migration 0005 and this handoff.** If you only have the old zip, you are missing `0005`. Use the newer zip if one was provided.
5. **Layouts don't re-run on every client-side navigation** (Next behaviour). Any page that loads private data must rely on RLS or re-check; Stage 3 pages must follow this.
6. **UI was never visually checked** in a browser or at mobile/tablet/desktop widths. Smoke tests were HTTP status codes and a few greps only.
7. No ESLint config or test runner is set up; the only automated tests are the SQL ones.
8. Demo data and sample numbers still back: dashboards' charts/stat cards, student overview, institute CRM table, lead-package picker, pricing page. Student saved listings, comparisons, and preferences are device-local.
9. Institute FAQs from the DB are always empty (no table). Faculty experience is self-reported.
10. Admin cannot view uploaded documents yet; no upload UI exists.
11. `RequestDialog` (callback/demo/contact) does not create enquiries or consent records yet.
12. Privacy policy and terms are placeholders requiring legal review under India's data-protection law.
13. Email provider not chosen; no email is sent anywhere (including signup confirmation beyond what Supabase itself sends).
14. Brief item "Test mobile, tablet, desktop layouts" is outstanding.

---

## 8. Exact next steps we planned

The conversation was in the middle of **Stage 3**. Three tracked tasks existed:

**Task A: Leads/consent/payments schema, RLS, idempotent allocation (SQL + tests).** `0005` is written. Remaining:
1. Add a `service_role` role to `supabase/tests/stub_supabase.sql` (conditional create).
2. Apply `0001`→`0005` on a fresh local Postgres; fix any SQL errors.
3. Write and run tests (append to `rls_test.sql` or a new file) covering: calling `mark_order_paid` twice with the same payment ⇒ one allocation set; same payment id replayed ⇒ no duplicate transaction/allocation; amount mismatch ⇒ not paid, no allocation; withdrawn consent ⇒ lead excluded from allocation and buyer loses read access; minor without guardian ⇒ insert rejected; duplicate phone+course ⇒ `duplicate_of` set and excluded; second order by same buyer never re-allocates the same enquiry; max-3-buyers rule; partial fulfilment when too few eligible; a student/buyer session cannot execute `fulfill_order`/`mark_order_paid`; buyer A cannot read enquiries allocated only to buyer B; student cannot set `status`/`duplicate_of`; a user cannot insert orders/transactions.
4. Add sample `lead_packages` (10/25/50/100 leads, clearly `is_demo`) to `seed.sql`. Make package prices admin-configurable.

**Task B: Razorpay lib, webhook, order/verify actions, signed CSV export.**
- `src/lib/payments/razorpay.ts`: create order (HTTP basic auth, `payment_capture=1`), `verifyCheckoutSignature`, `verifyWebhookSignature` (raw body, `timingSafeEqual`); unit-test with a known HMAC vector.
- `app/api/razorpay/webhook/route.ts`: verify signature, insert `webhook_events` (ignore duplicates, return 200), handle `payment.captured` → `mark_order_paid`, `payment.failed` → `mark_order_failed`.
- `createLeadOrder` action (role institute/tutor, resolve buyer id, amount from the package in DB, create order via service client) and `verifyPayment` action (verify signature, fetch payment from Razorpay, confirm status/order/amount, then `mark_order_paid`). No allocation from the client's success callback alone.
- CSV export: server-generated, ownership-checked, CSV-injection-safe, behind an HMAC-signed expiring token (`LEAD_EXPORT_SECRET`). XLSX optional later. Transactional email with only the secure link (provider TBD).

**Task C: Enquiry form with consent, lead UI, build and zip.**
- Student enquiry page (name, contact method, city, course, level, budget range, mode, timing) with the full disclosure (what is shared, why, who receives it, how it is used, how to withdraw/delete), a separate purpose-specific consent checkbox, separate optional marketing checkbox, guardian declaration when under 18, storing the exact disclosure text + `policy_version` in `consent_records`.
- Withdraw-consent action using `withdraw_enquiry`, shown in `/student/privacy` and `/student/enquiries`.
- Real lead package picker (packages from DB, eligibility explanation, Razorpay Checkout script) and purchased-leads pages for institute and tutor, using allocations.
- Update README, rebuild, rezip.

**After Stage 3:** finish Stage 2 leftovers (section 4), then Stage 4, then Stage 5.

**Immediate prerequisite to unblock live verification:** create a Supabase project, apply the migrations, and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only) in `.env.local`; assign an admin user. Then test sign-up/role redirects, onboarding, course publishing and admin approval end to end. For Stage 3 payments, Razorpay **test-mode** keys and a webhook secret are also needed.

---

## Quick start for the new environment

```bash
unzip edumatch.zip && cd edumatch
npm install
npm run dev          # http://localhost:3000 (demo data when Supabase is not configured)
npm run typecheck
npm run build
```
Local SQL tests need a Postgres instance you can create databases in (the original runs used a throwaway local Postgres 16, not the Supabase CLI).


---
## Addendum (latest state)
- Stage 3 is now written end to end: 0005 migration + tests (pass on Postgres 16), Razorpay lib/webhook/order/verify actions, signed CSV export, student enquiry form with consent, consent withdrawal, institute/tutor lead pages with Razorpay Checkout, sample `lead_packages` in seed.sql.
- App-side Supabase/Razorpay code is typechecked and builds, but has never run live. Test with Razorpay TEST keys.
- Still pending: tutor onboarding/verification, faculty screen, document upload + signed viewing, DB-backed favourites/comparisons, student profile persistence, email, admin package editor, refund UI, privacy access/correction/deletion requests, all of Stage 4 and automated Stage 5 tests.
- README test command now includes 0004, 0005 and leads_test.sql.


---
## IMPORTANT: database changed from Supabase/Postgres to MongoDB (latest)
The user asked for MongoDB instead of SQL. Everything Supabase-specific above (migrations, RLS, Supabase Auth, SQL tests) has been REMOVED and replaced:
- `src/lib/db/*` (client, types, collections, indexes), own auth in `src/lib/auth/*`, allocation/payment engine in `src/lib/leads/engine.ts`.
- Authorization is now in app code (no RLS); see README "Security model". Safety of payments/allocations rests on unique indexes (see `src/lib/db/indexes.ts`).
- Tests: `tests/leads/engine.test.mts` (18 checks, incl. concurrent replays), `tests/e2e/flow.test.mjs` (12 browser checks). Run against FerretDB, NOT Atlas.
- Password reset has no email delivery yet. Tutor onboarding is still the next planned feature.
