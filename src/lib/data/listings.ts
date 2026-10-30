/**
 * Data-access layer for public listings.
 * - MongoDB configured: reads ONLY published institutes/tutors (and published courses). Nothing private is selected.
 * - Not configured: reads the labelled fictional demo data.
 * Filtering/sorting currently runs in memory over the published set, which is fine for early volumes;
 * move it into Mongo queries (with indexes) before the catalogue grows large.
 * Search NEVER boosts results by ad spend: sorting is explicit and organic.
 */
import "server-only";
import { demoInstitutes, demoTutors } from "@/lib/demo/listings";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { mapInstitute, mapTutor } from "./mappers";
import type { Institute, InstituteFilters, Paged, Tutor, TutorFilters } from "@/types";

export const PAGE_SIZE = 6;

function paginate<T>(items: T[], page = 1): Paged<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

async function loadInstitutes(): Promise<Institute[]> {
  const db = await getDb();
  if (!db) return demoInstitutes;
  const c = col(db);
  const insts = await c.institutes.find({ status: "published" }).toArray();
  if (!insts.length) return [];
  const ids = insts.map((i) => i._id);
  const [courses, faculty] = await Promise.all([
    c.courses.find({ instituteId: { $in: ids }, published: true }).toArray(),
    c.faculty.find({ instituteId: { $in: ids } }).toArray(),
  ]);
  return insts.map((i) => mapInstitute(i, courses.filter((x) => x.instituteId === i._id), faculty.filter((x) => x.instituteId === i._id)));
}

async function loadTutors(): Promise<Tutor[]> {
  const db = await getDb();
  if (!db) return demoTutors;
  return (await col(db).tutors.find({ status: "published" }).toArray()).map(mapTutor);
}

const norm = (s: string) => s.trim().toLowerCase();

export function instituteTotalFee(i: Institute, courseIndex = 0) {
  const c = i.courses[courseIndex];
  return c ? c.tuitionFeeINR + c.otherFeesINR : 0;
}

export function minInstituteFee(i: Institute) {
  return Math.min(...i.courses.map((c) => c.tuitionFeeINR + c.otherFeesINR));
}

export function maxFacultyExperience(i: Institute) {
  return Math.max(0, ...i.faculty.map((f) => f.experienceYears));
}

export async function searchInstitutes(f: InstituteFilters): Promise<Paged<Institute>> {
  const all = await loadInstitutes();
  let list = all.filter((i) => {
    if (f.city && norm(i.city) !== norm(f.city)) return false;
    if (f.q) {
      const hay = norm([i.name, i.city, i.locality, ...i.categories, ...i.courses.map((c) => c.name)].join(" "));
      if (!hay.includes(norm(f.q))) return false;
    }
    if (f.verified && i.verification.status !== "verified") return false;
    if (f.demo && !i.demoAvailable) return false;
    if (f.language && !i.languages.includes(f.language)) return false;
    if (f.minExperience && maxFacultyExperience(i) < f.minExperience) return false;

    // Course-level criteria: at least one course must satisfy ALL course-level filters.
    const courseOk = i.courses.some((c) => {
      if (f.exam && c.exam !== f.exam) return false;
      if (f.level && !c.level.toLowerCase().includes(norm(f.level))) return false;
      if (f.mode && !(c.mode === f.mode || (f.mode === "hybrid" && c.mode === "hybrid"))) return false;
      const total = c.tuitionFeeINR + c.otherFeesINR;
      if (f.minBudget && total < f.minBudget) return false;
      if (f.maxBudget && total > f.maxBudget) return false;
      if (f.maxBatchSize && c.batchSize > f.maxBatchSize) return false;
      if (f.timing && !c.batchTimings.some((t) => timingBucket(t) === f.timing)) return false;
      return true;
    });
    return courseOk;
  });

  list = [...list].sort((a, b) => {
    switch (f.sort) {
      case "fee_asc": return minInstituteFee(a) - minInstituteFee(b);
      case "fee_desc": return minInstituteFee(b) - minInstituteFee(a);
      case "experience": return maxFacultyExperience(b) - maxFacultyExperience(a);
      case "updated": return b.lastUpdated.localeCompare(a.lastUpdated);
      default: return a.name.localeCompare(b.name); // "relevance": neutral, alphabetical in demo
    }
  });
  return paginate(list, f.page);
}

export function timingBucket(timing: string): "morning" | "afternoon" | "evening" | "weekend" {
  const t = timing.toLowerCase();
  if (/^(weekends?|sat|sun)/.test(t)) return "weekend";
  const m = t.match(/(\d{1,2}):\d{2}\s*(am|pm)/);
  if (!m) return "afternoon";
  const h = (parseInt(m[1], 10) % 12) + (m[2] === "pm" ? 12 : 0);
  if (h < 12) return "morning";
  if (h < 16) return "afternoon";
  return "evening";
}

export async function getInstituteBySlug(slug: string) {
  return (await loadInstitutes()).find((i) => i.slug === slug) ?? null;
}

export async function getInstitutesBySlugs(slugs: string[]) {
  const all = await loadInstitutes();
  return slugs.map((s) => all.find((i) => i.slug === s)).filter((i): i is Institute => Boolean(i));
}

export async function listInstitutes(limit?: number) {
  const all = await loadInstitutes();
  return limit ? all.slice(0, limit) : all;
}

export async function searchTutors(f: TutorFilters): Promise<Paged<Tutor>> {
  const allTutors = await loadTutors();
  let list = allTutors.filter((t) => {
    if (f.city && norm(t.city) !== norm(f.city)) return false;
    if (f.subject && !t.subjects.includes(f.subject)) return false;
    if (f.level && !t.levels.some((l) => norm(l).includes(norm(f.level!)))) return false;
    if (f.mode && !t.modes.includes(f.mode)) return false;
    if (f.language && !t.languages.includes(f.language)) return false;
    if (f.minExperience && t.experienceYears < f.minExperience) return false;
    if (f.minBudget && t.monthlyFeeINR < f.minBudget) return false;
    if (f.maxBudget && t.monthlyFeeINR > f.maxBudget) return false;
    if (f.demo && !t.demoAvailable) return false;
    if (f.verified && t.verification.status !== "verified") return false;
    if (f.q && !norm([t.name, t.headline, ...t.subjects, t.city].join(" ")).includes(norm(f.q))) return false;
    return true;
  });
  list = [...list].sort((a, b) => {
    switch (f.sort) {
      case "fee_asc": return a.monthlyFeeINR - b.monthlyFeeINR;
      case "fee_desc": return b.monthlyFeeINR - a.monthlyFeeINR;
      case "experience": return b.experienceYears - a.experienceYears;
      case "updated": return b.lastUpdated.localeCompare(a.lastUpdated);
      default: return a.name.localeCompare(b.name);
    }
  });
  return paginate(list, f.page);
}

export async function getTutorBySlug(slug: string) {
  return (await loadTutors()).find((t) => t.slug === slug) ?? null;
}

export async function listTutors(limit?: number) {
  const all = await loadTutors();
  return limit ? all.slice(0, limit) : all;
}
