"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form-controls";
import { useRouter } from "next/navigation";
import { submitInstituteApplication } from "@/lib/institute/actions";
import { instituteApplicationSchema, type InstituteApplicationInput } from "@/lib/validation/institute";
import type { ActionResult } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

const schema = instituteApplicationSchema;
type Values = InstituteApplicationInput;

const steps: { title: string; fields: (keyof Values)[] }[] = [
  { title: "Institute information", fields: ["name", "tagline", "about"] },
  { title: "Contact information", fields: ["contactPerson", "email", "phone"] },
  { title: "Location and address", fields: ["address", "city", "state", "pincode"] },
  { title: "Courses and subjects", fields: ["exams"] },
  { title: "Faculty information", fields: ["faculty"] },
  { title: "Fees and batch timings", fields: ["tuitionFee", "batchTimings"] },
  { title: "Supporting documents", fields: ["documents"] },
  { title: "Review and submit", fields: ["declaration"] },
];

const DRAFT_KEY = "edumatch.institute-draft";

export function InstituteWizard() {
  const [step, setStep] = React.useState(0);
  const [saved, setSaved] = React.useState<string | null>(null);
  const router = useRouter();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched" });
  const { register, trigger, getValues, reset, handleSubmit, formState: { errors } } = form;

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const { values, step: s } = JSON.parse(raw);
        reset(values);
        setStep(Math.min(Number(s) || 0, steps.length - 1));
        setSaved("Draft restored from this device");
      }
    } catch { /* ignore corrupt drafts */ }
  }, [reset]);

  function saveDraft() {
    try {
      const { declaration: _d, ...values } = getValues();
      void _d;
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step }));
      setSaved("Draft saved on this device only");
    } catch {
      setSaved("Could not save draft: browser storage unavailable");
    }
  }

  async function next() {
    const ok = await trigger(steps[step].fields as never);
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  const e = (k: keyof Values) => errors[k]?.message as string | undefined;
  const values = getValues();

  function onSubmit(v: Values) {
    startTransition(async () => {
      const res = await submitInstituteApplication(v);
      setResult(res);
      if (res.ok) {
        try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        if (res.redirectTo) router.push(res.redirectTo);
      }
    });
  }

  if (result?.ok) {
    return <StatusBanner title="Application submitted">{result.message}</StatusBanner>;
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Progress">
        <ol className="flex gap-1.5">
          {steps.map((s, idx) => (
            <li key={s.title} className="flex-1" aria-current={idx === step ? "step" : undefined}>
              <div className={cn("h-1.5 rounded-full", idx < step ? "bg-secondary" : idx === step ? "bg-primary" : "bg-line")} />
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-muted">Step {step + 1} of {steps.length}: <strong className="text-ink">{steps[step].title}</strong></p>
      </nav>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {step === 0 && (<>
            <Field label="Institute name" htmlFor="w-name" error={e("name")}><Input id="w-name" aria-invalid={!!errors.name} {...register("name")} /></Field>
            <Field label="Tagline (optional)" htmlFor="w-tag" error={e("tagline")}><Input id="w-tag" {...register("tagline")} /></Field>
            <Field label="About" htmlFor="w-about" error={e("about")}><Textarea id="w-about" aria-invalid={!!errors.about} {...register("about")} /></Field>
          </>)}
          {step === 1 && (<>
            <Field label="Contact person" htmlFor="w-cp" error={e("contactPerson")}><Input id="w-cp" {...register("contactPerson")} /></Field>
            <Field label="Email" htmlFor="w-email" error={e("email")}><Input id="w-email" type="email" {...register("email")} /></Field>
            <Field label="Mobile number" htmlFor="w-phone" error={e("phone")} hint="10-digit Indian mobile number"><Input id="w-phone" inputMode="tel" {...register("phone")} /></Field>
          </>)}
          {step === 2 && (<>
            <Field label="Address" htmlFor="w-addr" error={e("address")}><Textarea id="w-addr" {...register("address")} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" htmlFor="w-city" error={e("city")}><Input id="w-city" {...register("city")} /></Field>
              <Field label="State" htmlFor="w-state" error={e("state")}><Input id="w-state" {...register("state")} /></Field>
              <Field label="PIN code" htmlFor="w-pin" error={e("pincode")}><Input id="w-pin" inputMode="numeric" maxLength={6} {...register("pincode")} /></Field>
            </div>
          </>)}
          {step === 3 && (
            <Field label="Courses and exams you teach" htmlFor="w-exams" error={e("exams")} hint="Comma-separated, e.g. JEE Main, NEET, CBSE Class 10"><Textarea id="w-exams" {...register("exams")} /></Field>
          )}
          {step === 4 && (
            <Field label="Faculty" htmlFor="w-fac" error={e("faculty")} hint="One per line: name, qualification, years of experience. Qualifications stay marked provider-supplied until reviewed."><Textarea id="w-fac" {...register("faculty")} /></Field>
          )}
          {step === 5 && (<>
            <Field label="Tuition fee for your main course (₹)" htmlFor="w-fee" error={e("tuitionFee")}><Input id="w-fee" type="number" min={0} {...register("tuitionFee")} /></Field>
            <Field label="Batch timings" htmlFor="w-bt" error={e("batchTimings")}><Textarea id="w-bt" placeholder="Weekdays 4 PM – 7 PM" {...register("batchTimings")} /></Field>
          </>)}
          {step === 6 && (<>
            <StatusBanner title="Document upload is not built yet">
              File upload is not connected yet. List the documents you will provide (registration certificate, GST/PAN, address proof). Files are uploaded to private storage in the backend stage.
            </StatusBanner>
            <Field label="Documents you will submit" htmlFor="w-docs"><Textarea id="w-docs" {...register("documents")} /></Field>
          </>)}
          {step === 7 && (
            <div className="space-y-4 text-sm">
              <h2 className="text-lg font-semibold">Review your details</h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {([["Institute", values.name], ["Contact", `${values.contactPerson ?? ""} · ${values.phone ?? ""}`], ["City", values.city], ["Courses", values.exams], ["Fee (₹)", String(values.tuitionFee ?? "")]] as const).map(([k, v]) => (
                  <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium text-ink">{v || "Not provided"}</dd></div>
                ))}
              </dl>
              <StatusBanner title="What happens next">Your profile is reviewed by our team. The verified badge is granted only after document review, never automatically.</StatusBanner>
              <label className="flex gap-2"><Checkbox {...register("declaration")} /> I confirm the information is accurate and I am authorised to list this institute.</label>
              {errors.declaration && <p role="alert" className="text-xs font-medium text-danger">{e("declaration")}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button type="button" variant="ghost" onClick={saveDraft}><Save /> Save draft</Button>
            <div className="flex gap-2">
              {step > 0 && <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>Continue</Button>
              ) : (
                <Button type="submit" disabled={pending}><Check /> {pending ? "Submitting…" : "Submit for review"}</Button>
              )}
            </div>
          </div>
          {saved && <p role="status" className="text-xs text-muted">{saved}</p>}
          {result && !result.ok && (
            <StatusBanner tone="warning" title={result.preview ? "Backend not connected: nothing was saved" : "Could not submit"}>{result.error}</StatusBanner>
          )}
        </form>
      </Card>
    </div>
  );
}

