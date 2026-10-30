import type { InstituteFilters, TutorFilters, TeachingMode } from "@/types";

export type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const str = (v: string | string[] | undefined) => {
  const s = first(v)?.trim();
  return s ? s.slice(0, 80) : undefined;
};
const bool = (v: string | string[] | undefined) => first(v) === "1";

const sorts = ["relevance", "fee_asc", "fee_desc", "experience", "updated"] as const;
type Sort = (typeof sorts)[number];
const sort = (v: string | string[] | undefined): Sort | undefined => {
  const s = first(v);
  return sorts.includes(s as Sort) ? (s as Sort) : undefined;
};

export function parseInstituteParams(sp: RawParams): InstituteFilters {
  const mode = first(sp.mode);
  return {
    q: str(sp.q), city: str(sp.city), exam: str(sp.exam), level: str(sp.level),
    minBudget: num(sp.minBudget), maxBudget: num(sp.maxBudget),
    mode: (["online", "offline", "hybrid"].includes(mode ?? "") ? mode : undefined) as TeachingMode | undefined,
    language: str(sp.language), minExperience: num(sp.minExperience), maxBatchSize: num(sp.maxBatchSize),
    demo: bool(sp.demo), verified: bool(sp.verified), timing: str(sp.timing),
    sort: sort(sp.sort), page: num(sp.page),
  };
}

export function parseTutorParams(sp: RawParams): TutorFilters {
  const mode = first(sp.mode);
  return {
    q: str(sp.q), city: str(sp.city), subject: str(sp.subject), level: str(sp.level),
    minBudget: num(sp.minBudget), maxBudget: num(sp.maxBudget),
    mode: (["online", "home"].includes(mode ?? "") ? mode : undefined) as "online" | "home" | undefined,
    language: str(sp.language), minExperience: num(sp.minExperience),
    demo: bool(sp.demo), verified: bool(sp.verified), sort: sort(sp.sort), page: num(sp.page),
  };
}

/** Build a query string from raw params, optionally dropping / overriding keys. */
export function buildQuery(sp: RawParams, override: Record<string, string | undefined> = {}) {
  const out = new URLSearchParams();
  const merged: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) merged[k] = first(v);
  for (const [k, v] of Object.entries(override)) merged[k] = v;
  for (const [k, v] of Object.entries(merged)) if (v) out.set(k, v);
  const s = out.toString();
  return s ? `?${s}` : "";
}

export const filterLabels: Record<string, string> = {
  q: "Search", city: "City", exam: "Course", subject: "Subject", level: "Level",
  minBudget: "Min budget", maxBudget: "Max budget", mode: "Mode", language: "Language",
  minExperience: "Min experience", maxBatchSize: "Max batch size", demo: "Demo available",
  verified: "Verified only", timing: "Timing",
};
