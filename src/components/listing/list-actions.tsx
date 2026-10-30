"use client";

import Link from "next/link";
import { GitCompare, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPARE_KEY, FAVOURITES_KEY, MAX_COMPARE, useLocalList } from "@/hooks/use-local-list";

export function CompareToggle({ slug, size = "sm" }: { slug: string; size?: "sm" | "md" }) {
  const list = useLocalList(COMPARE_KEY, MAX_COMPARE);
  const selected = list.has(slug);
  const disabled = !selected && list.isFull;
  return (
    <Button
      type="button"
      variant={selected ? "secondary" : "outline"}
      size={size}
      disabled={disabled}
      aria-pressed={selected}
      title={disabled ? `You can compare up to ${MAX_COMPARE} institutes` : undefined}
      onClick={() => list.toggle(slug)}
    >
      <GitCompare />
      {selected ? "In comparison" : disabled ? "Comparison full" : "Compare"}
    </Button>
  );
}

export function FavouriteToggle({ id, size = "sm" }: { id: string; size?: "sm" | "md" }) {
  const list = useLocalList(FAVOURITES_KEY);
  const saved = list.has(id);
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-pressed={saved}
      title="Saved on this device. Account sync arrives with the backend stage."
      onClick={() => list.toggle(id)}
    >
      <Heart className={saved ? "fill-danger text-danger" : ""} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

/** Sticky bar shown on public pages once at least one institute is selected. */
export function CompareBar() {
  const list = useLocalList(COMPARE_KEY, MAX_COMPARE);
  if (list.items.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 shadow-soft backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="text-sm text-ink">
          <strong>{list.items.length}</strong> of {MAX_COMPARE} institutes selected for comparison
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => list.items.forEach((i) => list.remove(i))}
          >
            <X /> Clear
          </Button>
          {list.items.length < 2 ? (
            <Button type="button" size="sm" disabled title="Select at least two institutes to compare">Compare now</Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/compare?ids=${list.items.join(",")}`}>Compare now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
