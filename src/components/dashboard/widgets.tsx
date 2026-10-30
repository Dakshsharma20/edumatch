import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/feedback";

export function DashHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, delta, hint }: { label: string; value: string; icon: LucideIcon; delta?: number; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className="rounded-lg bg-primary-soft p-2 text-primary"><Icon className="size-4" /></span>
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {delta !== undefined && (
        <p className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${delta >= 0 ? "text-success" : "text-danger"}`}>
          {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(delta)}% vs last month <span className="ml-1 font-normal text-muted">(sample)</span>
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function Panel({ title, description, children, demo = false }: { title: string; description?: string; children: React.ReactNode; demo?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        {demo && <DemoNotice className="mt-2" />}
      </CardContent>
    </Card>
  );
}
