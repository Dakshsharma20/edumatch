import { z } from "zod";
import { INDIAN_MOBILE } from "@/lib/utils";

/** Shared by client forms (instant feedback) and server actions (the authoritative check). */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  role: z.enum(["student", "institute", "tutor"], { error: "Choose how you will use the platform" }),
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.email("Enter a valid email address"),
  phone: z.string().trim().regex(INDIAN_MOBILE, "Enter a valid 10-digit Indian mobile number"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72, "Use at most 72 characters")
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/\d/, "Include a number"),
  terms: z.literal(true, { error: "You must accept the terms and privacy policy" }),
});

const password = registerSchema.shape.password;
export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const newPasswordSchema = z.object({ token: z.string().min(20).max(200), password, confirm: z.string() }).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const forgotSchema = z.object({ email: z.email("Enter a valid email address") });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;

export type ActionResult =
  | { ok: true; message?: string; redirectTo?: string }
  | { ok: false; error: string; preview?: boolean };
