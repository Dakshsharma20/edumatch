import type { Collection, Db } from "mongodb";
import type * as T from "./types.ts";

/** Typed collection accessors. Authorization is NOT done here: every caller must scope its own queries (see lib/data/*). */
export const col = (db: Db) => ({
  users: db.collection<T.UserDoc>("users"),
  sessions: db.collection<T.SessionDoc>("sessions"),
  passwordResets: db.collection<T.PasswordResetDoc>("password_resets"),
  studentProfiles: db.collection<T.StudentProfileDoc>("student_profiles"),
  institutes: db.collection<T.InstituteDoc>("institutes"),
  instituteMembers: db.collection<T.InstituteMemberDoc>("institute_members"),
  institutePrivate: db.collection<T.InstitutePrivateDoc>("institute_private"),
  verificationDocs: db.collection<T.VerificationDocDoc>("verification_docs"),
  tutors: db.collection<T.TutorDoc>("tutors"),
  courses: db.collection<T.CourseDoc>("courses"),
  faculty: db.collection<T.FacultyDoc>("faculty"),
  auditLogs: db.collection<T.AuditLogDoc>("audit_logs"),
  guardians: db.collection<T.GuardianDoc>("guardians"),
  enquiries: db.collection<T.EnquiryDoc>("enquiries"),
  consents: db.collection<T.ConsentDoc>("consents"),
  leadPackages: db.collection<T.LeadPackageDoc>("lead_packages"),
  leadOrders: db.collection<T.LeadOrderDoc>("lead_orders"),
  payments: db.collection<T.PaymentDoc>("payments"),
  webhookEvents: db.collection<T.WebhookEventDoc>("webhook_events"),
  allocations: db.collection<T.AllocationDoc>("allocations"),
});
export type Collections = ReturnType<typeof col>;
export type { Collection };
