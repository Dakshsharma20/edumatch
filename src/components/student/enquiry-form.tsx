"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select } from "@/components/ui/form-controls";
import { LEAD_DISCLOSURE, MARKETING_DISCLOSURE } from "@/lib/leads/disclosure";
import { submitEnquiry } from "@/lib/leads/enquiry-actions";
import { enquirySchema, type EnquiryInput } from "@/lib/validation/leads";
import type { ActionResult } from "@/lib/validation/auth";

const num = { setValueAs: (v: string) => (v === "" || v === undefined ? undefined : Number(v)) };
const opt = { setValueAs: (v: string) => (v === "" ? undefined : v) };

export function EnquiryForm({ cities, courses }: { cities: string[]; courses: string[] }) {
  const router = useRouter();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { contactMethod: "phone", isMinor: false, consentMarketing: false },
  });
  const isMinor = watch("isMinor");
  const err = (k: keyof EnquiryInput) => errors[k]?.message as string | undefined;

  const onSubmit = (v: EnquiryInput) =>
    startTransition(async () => {
      const res = await submitEnquiry(v);
      setResult(res);
      if (res.ok && res.redirectTo) router.push(res.redirectTo);
    });

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="q-name" error={err("studentName")}><Input id="q-name" autoComplete="name" {...register("studentName")} /></Field>
          <Field label="Mobile number" htmlFor="q-phone" error={err("phone")} hint="10-digit Indian mobile number"><Input id="q-phone" inputMode="tel" {...register("phone")} /></Field>
          <Field label="How should providers contact you?" htmlFor="q-method">
            <Select id="q-method" {...register("contactMethod")}><option value="phone">Phone call</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option></Select>
          </Field>
          <Field label="Email (optional)" htmlFor="q-email" error={err("email")}><Input id="q-email" type="email" {...register("email")} /></Field>
          <Field label="City" htmlFor="q-city" error={err("city")}><Select id="q-city" {...register("city")}><option value="">Select a city</option>{cities.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Course or subject" htmlFor="q-course" error={err("course")}><Select id="q-course" {...register("course")}><option value="">Select a course</option>{courses.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Current class / level" htmlFor="q-level"><Input id="q-level" placeholder="e.g. Class 11" {...register("level")} /></Field>
          <Field label="Preferred mode" htmlFor="q-mode"><Select id="q-mode" {...register("mode", opt)}><option value="">Any</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></Select></Field>
          <Field label="Budget from (₹)" htmlFor="q-bmin" error={err("budgetMin")}><Input id="q-bmin" type="number" min={0} {...register("budgetMin", num)} /></Field>
          <Field label="Budget up to (₹)" htmlFor="q-bmax" error={err("budgetMax")}><Input id="q-bmax" type="number" min={0} {...register("budgetMax", num)} /></Field>
          <Field label="Preferred timing" htmlFor="q-time" className="sm:col-span-2"><Input id="q-time" placeholder="e.g. Weekday evenings" {...register("preferredTiming")} /></Field>
        </div>

        <label className="flex gap-2 text-sm"><Checkbox {...register("isMinor")} /> I am under 18 years old.</label>
        {isMinor && (
          <fieldset className="space-y-3 rounded-lg border border-line bg-canvas p-4">
            <legend className="px-1 text-sm font-medium text-ink">Parent or guardian</legend>
            <p className="text-xs text-muted">For students under 18, a parent or guardian must agree. We record this declaration; we do not independently verify it.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Name" htmlFor="g-name" error={err("guardianName")}><Input id="g-name" {...register("guardianName")} /></Field>
              <Field label="Mobile" htmlFor="g-phone" error={err("guardianPhone")}><Input id="g-phone" inputMode="tel" {...register("guardianPhone")} /></Field>
              <Field label="Relationship" htmlFor="g-rel" error={err("guardianRelationship")}><Input id="g-rel" placeholder="Mother" {...register("guardianRelationship")} /></Field>
            </div>
          </fieldset>
        )}

        <div className="space-y-3 rounded-lg border border-line-strong p-4">
          <h2 className="text-sm font-semibold text-ink">Before we share anything</h2>
          <div className="space-y-2 text-xs text-body">{LEAD_DISCLOSURE.split("\n").map((l) => <p key={l}>{l}</p>)}</div>
          <label className="flex gap-2 text-sm"><Checkbox {...register("consentLeadSharing")} /><span><strong>I agree</strong> to my details being shared as described above{isMinor ? ", and my parent or guardian agrees too" : ""}.</span></label>
          {err("consentLeadSharing") && <p role="alert" className="text-xs font-medium text-danger">{err("consentLeadSharing")}</p>}
          <label className="flex gap-2 text-xs text-body"><Checkbox {...register("consentMarketing")} /><span>{MARKETING_DISCLOSURE}</span></label>
        </div>

        {result && (result.ok
          ? <StatusBanner title={result.message ?? "Done"} />
          : <StatusBanner tone="warning" title={result.preview ? "Backend not connected: nothing was saved" : "Could not send"}>{result.error}</StatusBanner>)}
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save enquiry"}</Button>
      </form>
    </Card>
  );
}
