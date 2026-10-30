"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form-controls";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email address"),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000, "Keep it under 1000 characters"),
  consent: z.literal(true, { error: "Please agree so we can reply to you" }),
});
type Values = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  if (sent) {
    return <StatusBanner tone="warning" title="Demo mode: message not sent">Your message passed validation but no email service is connected yet, so nothing was delivered.</StatusBanner>;
  }
  return (
    <form onSubmit={handleSubmit(() => setSent(true))} noValidate className="space-y-4">
      <Field label="Name" htmlFor="c-name" error={errors.name?.message}><Input id="c-name" aria-invalid={!!errors.name} {...register("name")} /></Field>
      <Field label="Email" htmlFor="c-email" error={errors.email?.message}><Input id="c-email" type="email" aria-invalid={!!errors.email} {...register("email")} /></Field>
      <Field label="Message" htmlFor="c-msg" error={errors.message?.message}><Textarea id="c-msg" aria-invalid={!!errors.message} {...register("message")} /></Field>
      <label className="flex gap-2 text-sm"><Checkbox {...register("consent")} /> I agree that my details are used only to reply to this message.</label>
      {errors.consent && <p role="alert" className="text-xs font-medium text-danger">{errors.consent.message}</p>}
      <Button type="submit">Send message</Button>
    </form>
  );
}
