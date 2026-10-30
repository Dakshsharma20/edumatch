/** Document shapes. `_id` is a UUID string everywhere so ids stay plain strings in the app. Dates are real Dates. */
export type AppRole = "student" | "institute" | "tutor" | "admin";
export type ListingStatus = "draft" | "submitted" | "published" | "suspended" | "rejected";
export type Verification = "not_verified" | "pending_review" | "verified";
export type Mode = "online" | "offline" | "hybrid";
export type MemberRole = "owner" | "manager" | "staff";

export interface UserDoc {
  _id: string;
  email: string;            // stored lower-case, unique
  passwordHash: string;     // scrypt, never returned to callers
  fullName: string;
  phone?: string | null;
  /** Admin is NEVER assignable through the app. Set directly in the database. */
  roles: AppRole[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDoc { _id: string /* sha256 of token */; userId: string; expiresAt: Date; createdAt: Date; }

export interface StudentProfileDoc { _id: string /* userId */; budgetMin?: number | null; budgetMax?: number | null; city?: string | null; courses: string[]; languages: string[]; preferredMode?: Mode | null; updatedAt: Date; }

export interface InstituteDoc {
  _id: string; slug: string; name: string; tagline?: string | null; about?: string | null;
  city?: string | null; locality?: string | null; address?: string | null; pincode?: string | null;
  categories: string[]; modes: Mode[]; languages: string[]; facilities: string[]; refundPolicy?: string | null;
  status: ListingStatus; verification: Verification; isDemo: boolean;
  createdBy?: string | null; createdAt: Date; updatedAt: Date;
}
export interface InstituteMemberDoc { _id: string; instituteId: string; userId: string; memberRole: MemberRole; createdAt: Date; }
export interface InstitutePrivateDoc { _id: string /* instituteId */; contactPerson: string; contactEmail: string; contactPhone: string; state?: string | null; updatedAt: Date; }
export interface VerificationDocDoc { _id: string; ownerType: "institute" | "tutor"; ownerId: string; docType: string; storagePath: string; status: "uploaded" | "accepted" | "rejected"; reviewedBy?: string | null; reviewedAt?: Date | null; createdAt: Date; }

export interface TutorDoc {
  _id: string; userId?: string | null; slug: string; displayName: string; headline?: string | null; about?: string | null;
  city?: string | null; serviceLocalities: string[]; subjects: string[]; levels: string[]; online: boolean; home: boolean;
  languages: string[]; experienceYears?: number | null; qualifications: string[]; hourlyFeeInr?: number | null; monthlyFeeInr?: number | null;
  availability: string[]; demoAvailable: boolean; status: ListingStatus; verification: Verification; isDemo: boolean; createdAt: Date; updatedAt: Date;
}

export interface CourseDoc {
  _id: string; instituteId: string; name: string; exam?: string | null; level?: string | null; durationMonths?: number | null;
  tuitionFeeInr: number; otherFeesInr: number; mode: Mode; batchSize?: number | null; syllabus?: string | null; demoEnabled: boolean; published: boolean;
  batches: { id: string; timing: string; seatsTotal?: number | null; seatsAvailable?: number | null }[];
  createdAt: Date; updatedAt: Date;
}
export interface FacultyDoc { _id: string; instituteId: string; name: string; qualification?: string | null; experienceYears?: number | null; subjects: string[]; createdAt: Date; }

export interface AuditLogDoc { _id: string; actorId?: string | null; action: string; targetType?: string | null; targetId?: string | null; meta?: Record<string, unknown>; createdAt: Date; }

// ---- Stage 3 ----
export interface GuardianDoc { _id: string; studentId: string; guardianName: string; guardianPhone: string; relationship: string; createdAt: Date; }
export interface EnquiryDoc {
  _id: string; studentId: string; studentName: string; contactMethod: "phone" | "whatsapp" | "email"; phone: string; email?: string | null;
  city: string; course: string; /* lower-cased copies used for exact-match eligibility */ cityKey: string; courseKey: string;
  level?: string | null; budgetMin?: number | null; budgetMax?: number | null; mode?: Mode | null; preferredTiming?: string | null;
  isMinor: boolean; guardianId?: string | null; status: "valid" | "withdrawn" | "deleted"; duplicateOf?: string | null;
  /** Number of buyers this enquiry has been allocated to. Capped atomically at MAX_PROVIDERS_PER_ENQUIRY. */
  allocationCount: number; createdAt: Date; withdrawnAt?: Date | null;
}
export interface ConsentDoc { _id: string; studentId: string; enquiryId?: string | null; purpose: "lead_marketplace" | "direct_contact" | "marketing"; granted: boolean; policyVersion: string; disclosureText: string; createdAt: Date; withdrawnAt?: Date | null; }
export interface LeadPackageDoc { _id: string; audience: "institute" | "tutor"; name: string; leadsCount: number; pricePaise: number; maxAgeDays: number; active: boolean; isDemo: boolean; createdAt: Date; }
export type OrderStatus = "created" | "paid" | "fulfilled" | "partially_fulfilled" | "failed" | "refunded";
export interface LeadOrderDoc {
  _id: string; buyerType: "institute" | "tutor"; buyerId: string; buyerUserId: string; packageId: string; quantity: number; amountPaise: number;
  criteria: { course: string; city: string; mode?: Mode }; maxAgeDays: number; status: OrderStatus; razorpayOrderId?: string | null;
  allocatedCount: number; createdAt: Date; paidAt?: Date | null; fulfilledAt?: Date | null;
  /** Short-lived claim so only one worker fulfils an order at a time. */
  lockedAt?: Date | null;
}
export interface PaymentDoc { _id: string; orderId: string; razorpayOrderId: string; razorpayPaymentId: string; amountPaise: number; status: "captured" | "refunded" | "failed" | "amount_mismatch"; source: string; createdAt: Date; }
export interface WebhookEventDoc { _id: string /* Razorpay event id */; eventType: string; createdAt: Date; }
export interface AllocationDoc {
  _id: string; orderId: string; buyerType: "institute" | "tutor"; buyerId: string; enquiryId: string;
  /** 1..quantity within the order. UNIQUE (orderId, orderSlot): the database itself stops an order over-allocating. */
  orderSlot: number;
  /** 1..MAX_PROVIDERS within the enquiry. UNIQUE (enquiryId, enquirySlot): the database itself stops an enquiry being sold too often. */
  enquirySlot: number;
  createdAt: Date;
}

export interface PasswordResetDoc { _id: string /* sha256 of token */; userId: string; expiresAt: Date; createdAt: Date; }
