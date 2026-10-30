"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form-controls";
import { requestPasswordReset, signIn, signUp, updatePassword } from "@/lib/auth/actions";
import { forgotSchema, loginSchema, registerSchema, resetSchema, type ActionResult } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

/** Shows the outcome of a server action. Preview mode (no database) is called out explicitly. */
function Result({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  if (result.ok) return result.message ? <StatusBanner title={result.message} /> : null;
  return (
    <StatusBanner tone="warning" title={result.preview ? "Authentication is not connected" : "Something went wrong"}>
      {result.error}
    </StatusBanner>
  );
}

function useSubmit<T>(action: (v: T) => Promise<ActionResult>) {
  const router = useRouter();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();
  const run = (values: T) =>
    startTransition(async () => {
      const res = await action(values);
      setResult(res);
      if (res.ok && res.redirectTo) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  return { result, pending, run };
}

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const { result, pending, run } = useSubmit((v: z.infer<typeof loginSchema>) => signIn(v, next));
  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-muted">Welcome back.</p>
      {linkError && <div className="mt-4"><StatusBanner tone="warning" title="That link is invalid or has expired">Request a new one and try again.</StatusBanner></div>}
      <form onSubmit={handleSubmit(run)} noValidate className="mt-5 space-y-4">
        <Field label="Email" htmlFor="l-email" error={errors.email?.message}><Input id="l-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Password" htmlFor="l-pw" error={errors.password?.message}><Input id="l-pw" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} /></Field>
        <div className="text-right text-sm"><Link href="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link></div>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Logging in…" : "Log in"}</Button>
        <Result result={result} />
      </form>
      <p className="mt-5 text-center text-sm text-muted">New here? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></p>
    </Card>
  );
}

const roles = [
  { value: "student", label: "Student or parent", desc: "Find and compare coaching and tutors" },
  { value: "institute", label: "Coaching institute", desc: "List courses and manage enquiries" },
  { value: "tutor", label: "Personal tutor", desc: "Offer private tuition" },
] as const;

export function RegisterForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });
  const { result, pending, run } = useSubmit((v: z.infer<typeof registerSchema>) => signUp(v));
  const role = watch("role");
  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Creating an account does not share your details with any provider.</p>
      <form onSubmit={handleSubmit(run)} noValidate className="mt-5 space-y-4">
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-ink">I am a…</legend>
          <div className="space-y-2">
            {roles.map((r) => (
              <label key={r.value} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3", role === r.value ? "border-primary bg-primary-soft" : "border-line-strong")}>
                <input type="radio" value={r.value} className="mt-1 accent-primary" {...register("role")} />
                <span><span className="block text-sm font-medium text-ink">{r.label}</span><span className="text-xs text-muted">{r.desc}</span></span>
              </label>
            ))}
          </div>
          {errors.role && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.role.message}</p>}
        </fieldset>
        <Field label="Full name" htmlFor="r-name" error={errors.name?.message}><Input id="r-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} /></Field>
        <Field label="Email" htmlFor="r-email" error={errors.email?.message}><Input id="r-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Field label="Mobile number" htmlFor="r-phone" error={errors.phone?.message} hint="10-digit Indian mobile number"><Input id="r-phone" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} /></Field>
        <Field label="Password" htmlFor="r-pw" error={errors.password?.message} hint="At least 8 characters with a letter and a number"><Input id="r-pw" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} /></Field>
        <div>
          <label className="flex gap-2 text-sm"><Checkbox {...register("terms")} /> <span>I accept the <Link href="/terms" className="text-primary underline">terms</Link> and <Link href="/privacy" className="text-primary underline">privacy policy</Link>.</span></label>
          {errors.terms && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.terms.message}</p>}
        </div>
        <p className="text-xs text-muted">We will not send marketing messages unless you separately opt in later.</p>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Creating account…" : "Create account"}</Button>
        <Result result={result} />
      </form>
      <p className="mt-5 text-center text-sm text-muted">Already registered? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link></p>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const { result, pending, run } = useSubmit((v: z.infer<typeof forgotSchema>) => requestPasswordReset(v));
  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">Enter your email and we will send a reset link.</p>
      <form onSubmit={handleSubmit(run)} noValidate className="mt-5 space-y-4">
        <Field label="Email" htmlFor="f-email" error={errors.email?.message}><Input id="f-email" type="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</Button>
        <Result result={result} />
      </form>
      <p className="mt-5 text-center text-sm"><Link href="/login" className="font-medium text-primary hover:underline">Back to log in</Link></p>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });
  const { result, pending, run } = useSubmit((v: z.infer<typeof resetSchema>) => updatePassword({ ...v, token }));
  if (!token) return <Card className="mx-auto w-full max-w-md p-6"><h1 className="text-2xl font-bold">Reset link missing</h1><p className="mt-3 text-sm">Open the link from your reset email, or <Link href="/forgot-password" className="font-medium text-primary hover:underline">request a new one</Link>.</p></Card>;
  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-bold">Set a new password</h1>
      <form onSubmit={handleSubmit(run)} noValidate className="mt-5 space-y-4">
        <Field label="New password" htmlFor="n-pw" error={errors.password?.message} hint="At least 8 characters with a letter and a number"><Input id="n-pw" type="password" autoComplete="new-password" {...register("password")} /></Field>
        <Field label="Confirm password" htmlFor="n-pw2" error={errors.confirm?.message}><Input id="n-pw2" type="password" autoComplete="new-password" {...register("confirm")} /></Field>
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Saving…" : "Update password"}</Button>
        <Result result={result} />
      </form>
    </Card>
  );
}
