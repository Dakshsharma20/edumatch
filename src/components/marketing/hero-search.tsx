"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";

const budgets = [
  { label: "Any budget", value: "" },
  { label: "Up to ₹50,000", value: "50000" },
  { label: "Up to ₹1,00,000", value: "100000" },
  { label: "Up to ₹2,00,000", value: "200000" },
];

/** Search form. Navigates to the server-rendered results page using URL params. */
export function HeroSearch({ cities, exams, subjects }: { cities: string[]; exams: string[]; subjects: string[] }) {
  const router = useRouter();
  const [target, setTarget] = React.useState<"coaching" | "tutors">("coaching");
  const [mode, setMode] = React.useState<"" | "online" | "offline" | "hybrid">("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["city", "exam", "maxBudget"]) {
      const v = String(data.get(key) ?? "");
      if (v) params.set(key === "exam" && target === "tutors" ? "subject" : key, v);
    }
    if (mode) params.set("mode", mode === "offline" && target === "tutors" ? "home" : mode);
    router.push(`/${target === "coaching" ? "find-coaching" : "find-tutors"}?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-line bg-surface p-4 shadow-soft sm:p-5" aria-label="Search coaching and tutors">
      <div role="tablist" aria-label="Search type" className="mb-4 inline-flex rounded-lg bg-canvas p-1">
        {(["coaching", "tutors"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={target === t}
            onClick={() => setTarget(t)}
            className={cn("rounded-md px-4 py-1.5 text-sm font-medium", target === t ? "bg-surface text-primary shadow-sm" : "text-muted")}
          >
            {t === "coaching" ? "Coaching institutes" : "Personal tutors"}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="hs-city">City</Label>
          <Select id="hs-city" name="city" defaultValue="">
            <option value="">All cities</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="hs-exam">{target === "coaching" ? "Course or exam" : "Subject"}</Label>
          <Select id="hs-exam" name="exam" defaultValue="">
            <option value="">{target === "coaching" ? "All courses" : "All subjects"}</option>
            {(target === "coaching" ? exams : subjects).map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="hs-budget">Total budget</Label>
          <Select id="hs-budget" name="maxBudget" defaultValue="">
            {budgets.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" size="lg" className="w-full">
            <Search /> {target === "coaching" ? "Find Coaching" : "Find Tutors"}
          </Button>
        </div>
      </div>
      <fieldset className="mt-4 flex flex-wrap items-center gap-2">
        <legend className="sr-only">Learning mode</legend>
        <span className="text-sm text-muted">Mode:</span>
        {([["", "Any"], ["online", "Online"], ["offline", target === "coaching" ? "Offline" : "Home tuition"], ["hybrid", "Hybrid"]] as const)
          .filter(([v]) => !(target === "tutors" && v === "hybrid"))
          .map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={mode === v}
              onClick={() => setMode(v)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm",
                mode === v ? "border-primary bg-primary-soft font-medium text-primary" : "border-line-strong text-body hover:bg-canvas",
              )}
            >
              {label}
            </button>
          ))}
      </fieldset>
    </form>
  );
}
