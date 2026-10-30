"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import { INDIAN_MOBILE } from "@/lib/utils";

export type RequestKind = "callback" | "demo" | "contact" | "report";

const copy: Record<RequestKind, { title: string; desc: string; cta: string; purpose: string }> = {
  callback: {
    title: "Request a callback",
    desc: "Ask this provider to call you back about fees and batches.",
    cta: "Request callback",
    purpose: "so the provider can call you back about your enquiry",
  },
  demo: {
    title: "Book a demo class",
    desc: "Request a demo slot. The provider confirms the time with you.",
    cta: "Request demo",
    purpose: "so the provider can arrange and confirm your demo class",
  },
  contact: {
    title: "Share my contact details",
    desc: "Choose to share your contact details with this tutor.",
    cta: "Share my details",
    purpose: "so the tutor can contact you about tuition",
  },
  report: {
    title: "Report incorrect information",
    desc: "Tell our team what looks wrong on this listing.",
    cta: "Submit report",
    purpose: "so our team can review the listing",
  },
};

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().regex(INDIAN_MOBILE, "Enter a valid 10-digit Indian mobile number"),
  contactMethod: z.enum(["phone", "whatsapp", "email"]),
  message: z.string().max(500, "Keep the message under 500 characters").optional(),
  isMinor: z.boolean(),
  guardianConsent: z.boolean(),
  consent: z.literal(true, { error: "Consent is required to submit this request" }),
  marketing: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function RequestDialog({
  kind,
  providerName,
  triggerVariant = "primary",
  triggerSize = "md",
  className,
}: {
  kind: RequestKind;
  providerName: string;
  triggerVariant?: "primary" | "secondary" | "outline";
  triggerSize?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const c = copy[kind];
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { contactMethod: "phone", isMinor: false, guardianConsent: false, marketing: false },
  });
  const { register, handleSubmit, watch, formState: { errors }, reset, setError } = form;
  const isMinor = watch("isMinor");

  function onSubmit(values: Values) {
    if (values.isMinor && !values.guardianConsent) {
      setError("guardianConsent", { message: "A parent or guardian must consent for students under 18" });
      return;
    }
    // Stage 1: nothing is sent or stored. Stage 3 writes enquiry + consent_records server-side.
    setDone(true);
  }

  function close() {
    setOpen(false);
    setDone(false);
    reset();
  }

  return (
    <>
      <Button type="button" variant={triggerVariant} size={triggerSize} className={className} onClick={() => setOpen(true)}>
        {c.cta}
      </Button>
      <Modal open={open} onClose={close} title={c.title} description={`${c.desc} (${providerName})`}>
        {done ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-amber-900">
              <FlaskConical className="mt-0.5 size-4 shrink-0" />
              <p>
                <strong>Demo mode, nothing was sent.</strong> Your details were validated in your browser only and
                were not stored or shared. Live enquiries, consent records and delivery arrive in the lead-marketplace stage.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={close}>
              <CheckCircle2 /> Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Field label="Your name" htmlFor="rq-name" error={errors.name?.message}>
              <Input id="rq-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Mobile number" htmlFor="rq-phone" error={errors.phone?.message} hint="10-digit Indian mobile number">
              <Input id="rq-phone" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={!!errors.phone} {...register("phone")} />
            </Field>
            <Field label="Preferred contact method" htmlFor="rq-method">
              <Select id="rq-method" {...register("contactMethod")}>
                <option value="phone">Phone call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </Select>
            </Field>
            <Field label="Message (optional)" htmlFor="rq-msg" error={errors.message?.message}>
              <Textarea id="rq-msg" {...register("message")} />
            </Field>

            <div className="space-y-3 rounded-lg border border-line bg-canvas p-3 text-xs">
              <label className="flex gap-2 text-body">
                <Checkbox {...register("isMinor")} />
                <span>I am under 18 years old.</span>
              </label>
              {isMinor && (
                <label className="flex gap-2 text-body">
                  <Checkbox {...register("guardianConsent")} />
                  <span>My parent or guardian has agreed to this request on my behalf.</span>
                </label>
              )}
              {errors.guardianConsent && <p role="alert" className="font-medium text-danger">{errors.guardianConsent.message}</p>}

              <label className="flex gap-2 text-body">
                <Checkbox {...register("consent")} />
                <span>
                  <strong>I agree</strong> that my name, mobile number and contact preference will be shared with{" "}
                  <strong>{providerName}</strong> {c.purpose}. It will not be used for anything else. I can withdraw
                  consent or ask for deletion any time from Privacy &amp; Consent in my account, or by writing to support.
                </span>
              </label>
              {errors.consent && <p role="alert" className="font-medium text-danger">{errors.consent.message}</p>}

              <label className="flex gap-2 text-body">
                <Checkbox {...register("marketing")} />
                <span>(Optional, separate) Send me occasional updates and offers. Not required for this request.</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
              <Button type="submit">{c.cta}</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
