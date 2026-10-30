"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";

type Kind = "coaching" | "tutors";

export interface FilterOptions {
  cities: string[];
  exams: string[]; // exams (coaching) or subjects (tutors)
  levels: string[];
  languages: string[];
}

function FilterFields({ kind, values, options, prefix }: { kind: Kind; values: Record<string, string>; options: FilterOptions; prefix: string }) {
  const v = (k: string) => values[k] ?? "";
  const id = (k: string) => `${prefix}-${k}`;
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={id("q")}>Search by name</Label>
        <Input id={id("q")} name="q" defaultValue={v("q")} placeholder="Name or keyword" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor={id("city")}>City</Label>
          <Select id={id("city")} name="city" defaultValue={v("city")}>
            <option value="">All cities</option>
            {options.cities.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor={id("locality")}>Locality</Label>
          <Input id={id("locality")} disabled placeholder="Locality search arrives with location data" />
        </div>
        <div>
          <Label htmlFor={id("exam")}>{kind === "coaching" ? "Course or exam" : "Subject"}</Label>
          <Select id={id("exam")} name={kind === "coaching" ? "exam" : "subject"} defaultValue={kind === "coaching" ? v("exam") : v("subject")}>
            <option value="">{kind === "coaching" ? "All courses" : "All subjects"}</option>
            {options.exams.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor={id("level")}>Class or education level</Label>
          <Select id={id("level")} name="level" defaultValue={v("level")}>
            <option value="">Any level</option>
            {options.levels.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink">
          {kind === "coaching" ? "Total course cost (₹)" : "Monthly fee (₹)"}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <Input name="minBudget" type="number" min={0} step={1000} placeholder="Min" defaultValue={v("minBudget")} aria-label="Minimum budget" />
          <Input name="maxBudget" type="number" min={0} step={1000} placeholder="Max" defaultValue={v("maxBudget")} aria-label="Maximum budget" />
        </div>
      </fieldset>

      <div>
        <Label htmlFor={id("mode")}>Learning mode</Label>
        <Select id={id("mode")} name="mode" defaultValue={v("mode")}>
          <option value="">Any</option>
          <option value="online">Online</option>
          {kind === "coaching" ? (
            <>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </>
          ) : (
            <option value="home">Home tuition</option>
          )}
        </Select>
      </div>

      <div>
        <Label htmlFor={id("distance")}>Distance</Label>
        <Select id={id("distance")} disabled defaultValue="">
          <option value="">Needs location data (coming soon)</option>
        </Select>
      </div>

      <div>
        <Label htmlFor={id("language")}>Language</Label>
        <Select id={id("language")} name="language" defaultValue={v("language")}>
          <option value="">Any</option>
          {options.languages.map((c) => <option key={c}>{c}</option>)}
        </Select>
      </div>

      <div>
        <Label htmlFor={id("minExperience")}>Teacher experience</Label>
        <Select id={id("minExperience")} name="minExperience" defaultValue={v("minExperience")}>
          <option value="">Any</option>
          <option value="5">5+ years</option>
          <option value="10">10+ years</option>
          <option value="15">15+ years</option>
        </Select>
      </div>

      {kind === "coaching" && (
        <>
          <div>
            <Label htmlFor={id("maxBatchSize")}>Batch size</Label>
            <Select id={id("maxBatchSize")} name="maxBatchSize" defaultValue={v("maxBatchSize")}>
              <option value="">Any</option>
              <option value="20">Up to 20</option>
              <option value="40">Up to 40</option>
              <option value="60">Up to 60</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={id("timing")}>Available timings</Label>
            <Select id={id("timing")} name="timing" defaultValue={v("timing")}>
              <option value="">Any</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="weekend">Weekend</option>
            </Select>
          </div>
        </>
      )}

      <div>
        <Label htmlFor={id("rating")}>Minimum rating</Label>
        <Select id={id("rating")} disabled defaultValue="">
          <option value="">Unavailable: no reviews exist yet</option>
        </Select>
      </div>

      <div className="space-y-2.5 text-sm">
        <label className="flex items-center gap-2"><Checkbox name="demo" value="1" defaultChecked={v("demo") === "1"} /> Demo class available</label>
        <label className="flex items-center gap-2"><Checkbox name="verified" value="1" defaultChecked={v("verified") === "1"} /> Verified listings only</label>
      </div>
    </div>
  );
}

function FilterForm({ kind, values, options, prefix, onApply, basePath }: { kind: Kind; values: Record<string, string>; options: FilterOptions; prefix: string; onApply?: () => void; basePath: string }) {
  const router = useRouter();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, val] of data.entries()) if (typeof val === "string" && val.trim()) params.set(k, val.trim());
    if (values.sort) params.set("sort", values.sort);
    router.push(`${basePath}?${params.toString()}`);
    onApply?.();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Filters">
      <FilterFields kind={kind} values={values} options={options} prefix={prefix} />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Apply filters</Button>
        <Button asChild variant="outline"><Link href={basePath} onClick={onApply}>Reset</Link></Button>
      </div>
    </form>
  );
}

export function FiltersShell({ kind, values, options, basePath }: { kind: Kind; values: Record<string, string>; options: FilterOptions; basePath: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <aside className="hidden rounded-card border border-line bg-surface p-5 lg:block" aria-label="Filters">
        <h2 className="mb-4 text-base font-semibold text-ink">Filters</h2>
        <FilterForm kind={kind} values={values} options={options} prefix="d" basePath={basePath} />
      </aside>
      <div className="lg:hidden">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <SlidersHorizontal /> Filters
        </Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Filters" variant="drawer">
          <FilterForm kind={kind} values={values} options={options} prefix="m" basePath={basePath} onApply={() => setOpen(false)} />
        </Modal>
      </div>
    </>
  );
}
