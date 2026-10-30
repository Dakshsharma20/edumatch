import * as React from "react";
import { AlertTriangle, FlaskConical, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-slate-200/70", className)} />;
}

export function EmptyState({
  icon: Icon = Info,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <div className="mb-3 rounded-full bg-primary-soft p-3 text-primary">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Marks sample records so they are never mistaken for real data. */
export function DemoNotice({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-amber-900",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0" />
      <span>
        <strong>Demo data.</strong>{" "}
        {children ?? "Fictional sample records for UI preview. Nothing here is real, verified, or live."}
      </span>
    </div>
  );
}

export function StatusBanner({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning";
  title: string;
  children?: React.ReactNode;
}) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-card border p-4 text-sm",
        tone === "warning" ? "border-warning/30 bg-warning-soft text-amber-900" : "border-primary/20 bg-primary-soft text-indigo-950",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-0.5 opacity-90">{children}</div>}
      </div>
    </div>
  );
}
