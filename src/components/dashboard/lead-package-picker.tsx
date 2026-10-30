"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/form-controls";
import { StatusBanner } from "@/components/ui/feedback";
import { cn, formatINR } from "@/lib/utils";

interface Pkg { id: string; leads: number; priceINR: number }

/** UI preview of the lead-package flow. Payment and allocation are NOT implemented in Stage 1. */
export function LeadPackagePicker({ packages, cities, exams }: { packages: Pkg[]; cities: string[]; exams: string[] }) {
  const [selected, setSelected] = React.useState<string>(packages[0]?.id ?? "");
  const pkg = packages.find((p) => p.id === selected);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card className="p-5">
          <h2 className="font-semibold text-ink">1. Targeting</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Course or subject" htmlFor="lp-course"><Select id="lp-course">{exams.map((e) => <option key={e}>{e}</option>)}</Select></Field>
            <Field label="Target city" htmlFor="lp-city"><Select id="lp-city">{cities.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Learning mode" htmlFor="lp-mode"><Select id="lp-mode"><option>Any</option><option>Online</option><option>Offline</option><option>Hybrid</option></Select></Field>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-ink">2. Choose a package</h2>
          <div role="radiogroup" aria-label="Lead package" className="mt-3 grid gap-3 sm:grid-cols-2">
            {packages.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected === p.id}
                onClick={() => setSelected(p.id)}
                className={cn("rounded-lg border p-4 text-left", selected === p.id ? "border-primary bg-primary-soft" : "border-line-strong hover:bg-canvas")}
              >
                <span className="block text-lg font-bold text-ink">{p.leads} enquiries</span>
                <span className="text-sm">{formatINR(p.priceINR)} <span className="text-xs text-muted">(sample price)</span></span>
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Card className="h-fit p-5">
        <h2 className="font-semibold text-ink">3. Eligibility and price</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
          <li>Valid, unwithdrawn consent for providers like you</li>
          <li>Course, location and mode match</li>
          <li>Not already allocated to you (duplicate check)</li>
          <li>Within the allowed lead age</li>
        </ul>
        <p className="mt-3 text-xs text-muted">Enquiries are called “verified” only when those checks have actually run.</p>
        <p className="mt-4 text-2xl font-bold text-ink">{pkg ? formatINR(pkg.priceINR) : "—"}</p>
        <Button disabled className="mt-3 w-full" title="Razorpay checkout and server-side allocation are built in Stage 3">Checkout not live yet</Button>
        <div className="mt-3"><StatusBanner tone="warning" title="No payment is taken">Leads are only allocated after server-verified payment. That flow ships in Stage 3.</StatusBanner></div>
      </Card>
    </div>
  );
}
