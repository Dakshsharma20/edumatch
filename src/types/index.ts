export type TeachingMode = "online" | "offline" | "hybrid";

/**
 * Verification is only ever "verified" after an admin has reviewed documents.
 * All Stage 1 demo listings are "not_verified" or "pending_review".
 */
export type VerificationStatus = "not_verified" | "pending_review" | "verified";

export interface Course {
  id: string;
  name: string;
  /** Exam / subject category, e.g. "JEE Main & Advanced". */
  exam: string;
  level: string;
  durationMonths: number;
  tuitionFeeINR: number;
  otherFeesINR: number;
  mode: TeachingMode;
  batchTimings: string[];
  batchSize: number;
  demoEnabled: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  qualification: string;
  experienceYears: number;
  subjects: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface Institute {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  city: string;
  locality: string;
  address: string;
  categories: string[];
  modes: TeachingMode[];
  languages: string[];
  about: string;
  facilities: string[];
  refundPolicy: string;
  courses: Course[];
  faculty: Faculty[];
  faqs: Faq[];
  lastUpdated: string;
  verification: { status: VerificationStatus; note: string };
  /** null until real reviews exist. We never invent ratings. */
  rating: { average: number; count: number } | null;
  demoAvailable: boolean;
  isDemo: boolean;
}

export interface Tutor {
  id: string;
  slug: string;
  name: string;
  headline: string;
  city: string;
  serviceLocalities: string[];
  subjects: string[];
  levels: string[];
  modes: ("online" | "home")[];
  languages: string[];
  experienceYears: number;
  qualifications: string[];
  about: string;
  hourlyFeeINR: number;
  monthlyFeeINR: number;
  availability: string[];
  demoAvailable: boolean;
  lastUpdated: string;
  verification: { status: VerificationStatus; note: string };
  rating: { average: number; count: number } | null;
  isDemo: boolean;
}

export interface InstituteFilters {
  city?: string;
  exam?: string;
  level?: string;
  minBudget?: number;
  maxBudget?: number;
  mode?: TeachingMode;
  language?: string;
  minExperience?: number;
  maxBatchSize?: number;
  demo?: boolean;
  verified?: boolean;
  timing?: string;
  q?: string;
  sort?: "relevance" | "fee_asc" | "fee_desc" | "experience" | "updated";
  page?: number;
}

export interface TutorFilters {
  city?: string;
  subject?: string;
  level?: string;
  minBudget?: number;
  maxBudget?: number;
  mode?: "online" | "home";
  language?: string;
  minExperience?: number;
  demo?: boolean;
  verified?: boolean;
  q?: string;
  sort?: "relevance" | "fee_asc" | "fee_desc" | "experience" | "updated";
  page?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
