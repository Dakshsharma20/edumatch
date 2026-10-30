import { z } from "zod";

export const createOrderSchema = z.object({
  packageId: z.string().uuid("Choose a package"),
  course: z.string().trim().min(2, "Choose a course or subject").max(80),
  city: z.string().trim().min(2, "Choose a target city").max(80),
  mode: z.enum(["online", "offline", "hybrid"]).optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpayPaymentId: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpaySignature: z.string().regex(/^[0-9a-f]{64}$/i),
});

export const enquirySchema = z.object({
  studentName: z.string().trim().min(2, "Enter your name").max(120),
  contactMethod: z.enum(["phone", "whatsapp", "email"]),
  phone: z.string().trim().regex(/^(?:\+91[\s-]?|0)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]).optional(),
  city: z.string().trim().min(2, "Enter your city").max(80),
  course: z.string().trim().min(2, "Choose a course or subject").max(80),
  level: z.string().trim().max(80).optional(),
  budgetMin: z.coerce.number().int().min(0).max(10_000_000).optional(),
  budgetMax: z.coerce.number().int().min(0).max(10_000_000).optional(),
  mode: z.enum(["online", "offline", "hybrid"]).optional(),
  preferredTiming: z.string().trim().max(120).optional(),
  isMinor: z.boolean(),
  guardianName: z.string().trim().max(120).optional(),
  guardianPhone: z.string().trim().optional(),
  guardianRelationship: z.string().trim().max(40).optional(),
  // Purpose-specific, explicit consent. Marketing is separate and optional.
  consentLeadSharing: z.literal(true, { error: "Consent is required to share this enquiry" }),
  consentMarketing: z.boolean(),
}).superRefine((v, ctx) => {
  if (v.budgetMin !== undefined && v.budgetMax !== undefined && v.budgetMax < v.budgetMin)
    ctx.addIssue({ code: "custom", path: ["budgetMax"], message: "Max budget must be at least the minimum" });
  if (v.contactMethod === "email" && !v.email)
    ctx.addIssue({ code: "custom", path: ["email"], message: "Enter an email address for email contact" });
  if (v.isMinor) {
    if (!v.guardianName || v.guardianName.length < 2) ctx.addIssue({ code: "custom", path: ["guardianName"], message: "Parent or guardian name is required for students under 18" });
    if (!v.guardianPhone || !/^(?:\+91[\s-]?|0)?[6-9]\d{9}$/.test(v.guardianPhone)) ctx.addIssue({ code: "custom", path: ["guardianPhone"], message: "Enter a valid guardian mobile number" });
    if (!v.guardianRelationship || v.guardianRelationship.length < 2) ctx.addIssue({ code: "custom", path: ["guardianRelationship"], message: "Enter the relationship (e.g. Mother)" });
  }
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type VerifyPaymentInput = z.input<typeof verifyPaymentSchema>;
export type EnquiryInput = z.input<typeof enquirySchema>;
