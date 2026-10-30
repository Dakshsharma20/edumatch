"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { saveCourse, setCoursePublished } from "@/lib/institute/actions";
import { courseSchema, type CourseInput } from "@/lib/validation/institute";
import type { ActionResult } from "@/lib/validation/auth";
import { formatINR } from "@/lib/utils";

export interface CourseRow {
  id: string; name: string; exam: string | null; durationMonths: number | null;
  tuitionFeeINR: number; otherFeesINR: number; mode: string; published: boolean; timings: string[];
}

export function CourseManager({ courses, canEdit }: { courses: CourseRow[]; canEdit: boolean }) {
  const router = useRouter();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: { mode: "offline", demoEnabled: false, otherFeesINR: 0 },
  });

  const onSubmit = (v: CourseInput) =>
    startTransition(async () => {
      const res = await saveCourse(v);
      setResult(res);
      if (res.ok) { reset(); router.refresh(); }
    });

  const toggle = (c: CourseRow) =>
    startTransition(async () => {
      const res = await setCoursePublished(c.id, !c.published);
      setResult(res.ok ? null : res);
      if (res.ok) router.refresh();
    });

  return (
    <div className="space-y-6">
      {result && (
        result.ok
          ? result.message ? <StatusBanner title={result.message} /> : null
          : <StatusBanner tone="warning" title={result.preview ? "Backend not connected: nothing was saved" : "Something went wrong"}>{result.error}</StatusBanner>
      )}

      {courses.length === 0 ? (
        <Card className="p-6 text-sm text-muted">No courses yet. Add your first course below. New courses start unpublished.</Card>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-sm text-muted">
                    {c.exam ?? "No exam set"} · {c.durationMonths ?? "?"} months · <span className="capitalize">{c.mode}</span> · {formatINR(c.tuitionFeeINR + c.otherFeesINR)} total
                  </p>
                  {c.timings.length > 0 && <p className="text-xs text-muted">{c.timings.join(" | ")}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.published ? "success" : "neutral"}>{c.published ? "Published" : "Unpublished"}</Badge>
                  <Button type="button" size="sm" variant="outline" disabled={pending || !canEdit} onClick={() => toggle(c)}>
                    {c.published ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted">A published course is only visible to students once your institute itself has been approved and published by an administrator.</p>

      <Card className="p-5">
        <h2 className="font-semibold text-ink">Add a course</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course name" htmlFor="c-name" error={errors.name?.message}><Input id="c-name" {...register("name")} /></Field>
            <Field label="Exam or category" htmlFor="c-exam" error={errors.exam?.message}><Input id="c-exam" placeholder="e.g. JEE Main & Advanced" {...register("exam")} /></Field>
            <Field label="Class / level" htmlFor="c-level" error={errors.level?.message}><Input id="c-level" placeholder="e.g. Class 11–12" {...register("level")} /></Field>
            <Field label="Duration (months)" htmlFor="c-dur" error={errors.durationMonths?.message}><Input id="c-dur" type="number" min={1} {...register("durationMonths")} /></Field>
            <Field label="Tuition fee (₹)" htmlFor="c-fee" error={errors.tuitionFeeINR?.message}><Input id="c-fee" type="number" min={0} {...register("tuitionFeeINR")} /></Field>
            <Field label="Other fees (₹)" htmlFor="c-other" error={errors.otherFeesINR?.message} hint="Registration, material. Enter 0 if none."><Input id="c-other" type="number" min={0} {...register("otherFeesINR")} /></Field>
            <Field label="Teaching mode" htmlFor="c-mode"><Select id="c-mode" {...register("mode")}><option value="offline">Offline</option><option value="online">Online</option><option value="hybrid">Hybrid</option></Select></Field>
            <Field label="Batch size" htmlFor="c-batch" error={errors.batchSize?.message}><Input id="c-batch" type="number" min={1} {...register("batchSize")} /></Field>
            <Field label="Batch timing" htmlFor="c-timing" error={errors.timing?.message}><Input id="c-timing" placeholder="Weekdays 4 PM – 7 PM" {...register("timing")} /></Field>
            <Field label="Available seats (optional)" htmlFor="c-seats" error={errors.seats?.message}><Input id="c-seats" type="number" min={0} {...register("seats")} /></Field>
          </div>
          <Field label="Syllabus (optional)" htmlFor="c-syl" error={errors.syllabus?.message}><Textarea id="c-syl" {...register("syllabus")} /></Field>
          <label className="flex items-center gap-2 text-sm"><Checkbox {...register("demoEnabled")} /> Offer demo classes for this course</label>
          <Button type="submit" disabled={pending || !canEdit}>{pending ? "Saving…" : "Create course"}</Button>
        </form>
      </Card>
    </div>
  );
}
