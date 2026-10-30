"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Select } from "@/components/ui/form-controls";
import { buildQuery, filterLabels, type RawParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export function SortSelect({ basePath }: { basePath: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "relevance";
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-muted">Sort by</label>
      <Select
        id="sort"
        className="w-52"
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(sp.toString());
          params.set("sort", e.target.value);
          params.delete("page");
          router.push(`${basePath}?${params.toString()}`);
        }}
      >
        <option value="relevance">Name (A–Z)</option>
        <option value="fee_asc">Fees: low to high</option>
        <option value="fee_desc">Fees: high to low</option>
        <option value="experience">Experience: high to low</option>
        <option value="updated">Recently updated</option>
      </Select>
    </div>
  );
}

export function ActiveChips({ params, basePath }: { params: RawParams; basePath: string }) {
  const chips = Object.entries(params).filter(([k, v]) => v && k in filterLabels);
  if (chips.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map(([k, v]) => {
        const value = v === "1" ? "" : `: ${Array.isArray(v) ? v[0] : v}`;
        return (
          <li key={k}>
            <Link
              href={`${basePath}${buildQuery(params, { [k]: undefined, page: undefined })}`}
              className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary hover:bg-indigo-100"
              aria-label={`Remove filter ${filterLabels[k]}`}
            >
              {filterLabels[k]}{value} <X className="size-3" />
            </Link>
          </li>
        );
      })}
      <li>
        <Link href={basePath} className="px-2 py-1 text-xs font-medium text-muted hover:text-primary">Clear all</Link>
      </li>
    </ul>
  );
}

export function Pagination({ page, totalPages, params, basePath }: { page: number; totalPages: number; params: RawParams; basePath: string }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `${basePath}${buildQuery(params, { page: p === 1 ? undefined : String(p) })}`;
  const item = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(item, "border-line-strong bg-surface hover:bg-canvas")} aria-label="Previous page"><ChevronLeft className="size-4" /></Link>
      ) : null}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(item, p === page ? "border-primary bg-primary text-white" : "border-line-strong bg-surface hover:bg-canvas")}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(item, "border-line-strong bg-surface hover:bg-canvas")} aria-label="Next page"><ChevronRight className="size-4" /></Link>
      ) : null}
    </nav>
  );
}
