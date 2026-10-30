import type { CourseDoc, FacultyDoc, InstituteDoc, TutorDoc } from "@/lib/db/types";
import type { Course, Faculty, Institute, Tutor, VerificationStatus } from "@/types";

const verificationNote: Record<VerificationStatus, string> = {
  verified: "Documents reviewed and approved by an administrator.",
  pending_review: "Submitted for review. Not yet verified.",
  not_verified: "Not verified. Details are supplied by the provider.",
};

export function mapInstitute(row: InstituteDoc, courseDocs: CourseDoc[], facultyDocs: FacultyDoc[]): Institute {
  const courses: Course[] = courseDocs.map((c) => ({
    id: c._id,
    name: c.name,
    exam: c.exam ?? "",
    level: c.level ?? "",
    durationMonths: c.durationMonths ?? 0,
    tuitionFeeINR: c.tuitionFeeInr,
    otherFeesINR: c.otherFeesInr ?? 0,
    mode: c.mode,
    batchTimings: (c.batches ?? []).map((b) => b.timing),
    batchSize: c.batchSize ?? 0,
    demoEnabled: !!c.demoEnabled,
  }));
  const faculty: Faculty[] = facultyDocs.map((f) => ({
    id: f._id, name: f.name, qualification: f.qualification ?? "", experienceYears: f.experienceYears ?? 0, subjects: f.subjects ?? [],
  }));
  const status: VerificationStatus = row.verification;
  return {
    id: row._id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    city: row.city ?? "",
    locality: row.locality ?? "",
    address: row.address ?? "",
    categories: row.categories ?? [],
    modes: row.modes ?? [],
    languages: row.languages ?? [],
    about: row.about ?? "",
    facilities: row.facilities ?? [],
    refundPolicy: row.refundPolicy ?? "Not provided",
    courses,
    faculty,
    faqs: [], // FAQs arrive in a later stage
    lastUpdated: row.updatedAt.toISOString(),
    verification: { status, note: verificationNote[status] },
    rating: null, // reviews arrive in Stage 4; never invented
    demoAvailable: courses.some((c) => c.demoEnabled),
    isDemo: !!row.isDemo,
  };
}

export function mapTutor(row: TutorDoc): Tutor {
  const status: VerificationStatus = row.verification;
  return {
    id: row._id,
    slug: row.slug,
    name: row.displayName,
    headline: row.headline ?? "",
    city: row.city ?? "",
    serviceLocalities: row.serviceLocalities ?? [],
    subjects: row.subjects ?? [],
    levels: row.levels ?? [],
    modes: [...(row.online ? ["online" as const] : []), ...(row.home ? ["home" as const] : [])],
    languages: row.languages ?? [],
    experienceYears: row.experienceYears ?? 0,
    qualifications: row.qualifications ?? [],
    about: row.about ?? "",
    hourlyFeeINR: row.hourlyFeeInr ?? 0,
    monthlyFeeINR: row.monthlyFeeInr ?? 0,
    availability: row.availability ?? [],
    demoAvailable: !!row.demoAvailable,
    lastUpdated: row.updatedAt.toISOString(),
    verification: { status, note: verificationNote[status] },
    rating: null,
    isDemo: !!row.isDemo,
  };
}
