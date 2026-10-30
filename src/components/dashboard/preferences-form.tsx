"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";

const schema = z
  .object({
    minBudget: z.coerce.number({ error: "Enter a number" }).min(0, "Cannot be negative"),
    maxBudget: z.coerce.number({ error: "Enter a number" }).min(0, "Cannot be negative"),
    city: z.string().trim().min(2, "Enter your preferred city"),
    courses: z.string().trim().min(2, "Enter at least one course or exam"),
    languages: z.string().trim().min(2, "Enter at least one language"),
    mode: z.enum(["any", "online", "offline", "hybrid"]),
  })
  .refine((v) => v.maxBudget >= v.minBudget, { path: ["maxBudget"], message: "Max budget must be at least the minimum" });
type Values = z.input<typeof schema>;

const KEY = "edumatch.student-preferences";

export function PreferencesForm() {
  const [status, setStatus] = React.useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "any" },
  });

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) reset(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [reset]);

  function onSubmit(values: Values) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(values));
      setStatus("Saved on this device. Account storage arrives with the backend stage.");
    } catch {
      setStatus("Could not save: browser storage is unavailable.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minimum budget (₹)" htmlFor="p-min" error={errors.minBudget?.message}><Input id="p-min" type="number" min={0} {...register("minBudget")} /></Field>
        <Field label="Maximum budget (₹)" htmlFor="p-max" error={errors.maxBudget?.message}><Input id="p-max" type="number" min={0} {...register("maxBudget")} /></Field>
        <Field label="Preferred city / locality" htmlFor="p-city" error={errors.city?.message}><Input id="p-city" {...register("city")} /></Field>
        <Field label="Preferred teaching mode" htmlFor="p-mode">
          <Select id="p-mode" {...register("mode")}>
            <option value="any">Any</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option>
          </Select>
        </Field>
        <Field label="Courses or exams" htmlFor="p-courses" error={errors.courses?.message} hint="Comma-separated"><Input id="p-courses" {...register("courses")} /></Field>
        <Field label="Languages" htmlFor="p-lang" error={errors.languages?.message} hint="Comma-separated"><Input id="p-lang" {...register("languages")} /></Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit">Save preferences</Button>
        {status && <p role="status" className="text-xs text-muted">{status}</p>}
      </div>
    </form>
  );
}
