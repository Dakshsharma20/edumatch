export type Portal = "student" | "institute" | "tutor" | "admin";

export interface NavItem {
  label: string;
  /** Path segment under the portal, or an absolute href when `external` is true. */
  slug: string;
  icon: string;
  external?: boolean;
  /** Stage in which this module becomes functional. */
  stage: 2 | 3 | 4;
  description: string;
  capabilities: string[];
}

const i = (label: string, slug: string, icon: string, stage: 2 | 3 | 4, description: string, capabilities: string[] = [], external = false): NavItem => ({
  label, slug, icon, stage, description, capabilities, external,
});

export const portalMeta: Record<Portal, { title: string; base: string }> = {
  student: { title: "Student & Parent", base: "/student" },
  institute: { title: "Coaching Institute", base: "/institute" },
  tutor: { title: "Personal Tutor", base: "/tutor" },
  admin: { title: "Administration", base: "/admin" },
};

export const navItems: Record<Portal, NavItem[]> = {
  student: [
    i("Overview", "dashboard", "layout-dashboard", 2, "Your recommendations, saved listings and upcoming demos."),
    i("My Profile", "profile", "user", 2, "Update your learning preferences.", ["Budget and preferred location", "Courses and languages", "Preferred teaching mode"]),
    i("Find Coaching", "/find-coaching", "search", 2, "", [], true),
    i("Find Tutors", "/find-tutors", "graduation-cap", 2, "", [], true),
    i("Compare Institutes", "comparisons", "git-compare", 2, "Saved comparison lists of up to four institutes.", ["Persist comparisons to your account", "Plain-language explanation of differences (Stage 4)"]),
    i("Saved Institutes", "favourites", "heart", 2, "Institutes and tutors you have saved.", ["Synced across devices", "Notes on each listing"]),
    i("Saved Tutors", "saved-tutors", "bookmark", 2, "Tutors you have saved.", ["Synced across devices"]),
    i("My Enquiries", "enquiries", "message-square", 3, "Track every enquiry and who received it.", ["Status of each enquiry", "Withdraw consent for a specific enquiry"]),
    i("Demo Bookings", "bookings", "calendar-check", 4, "Your requested and confirmed demo classes.", ["Upcoming and past demos", "Reschedule or cancel requests"]),
    i("Notifications", "notifications", "bell", 4, "Updates about enquiries and demos."),
    i("Privacy and Consent", "privacy", "shield-check", 3, "See and control every consent you have given.", ["Consent history with timestamps and policy versions", "Withdraw consent", "Request access, correction or deletion", "Parent/guardian consent records"]),
    i("Account Settings", "settings", "settings", 2, "Email, password and account deletion."),
  ],
  institute: [
    i("Overview", "dashboard", "layout-dashboard", 2, "Performance and next actions."),
    i("Institute Profile", "profile", "building", 2, "Edit your public profile and submit documents for verification.", ["Profile editor", "Document upload to private storage", "Verification status"]),
    i("Courses and Batches", "courses", "book-open", 2, "Create and publish courses.", ["Fees, duration and seats", "Batch timings and syllabus", "Publish or unpublish", "Enable demo bookings"]),
    i("Faculty Management", "faculty", "users", 2, "Manage faculty profiles.", ["Add faculty and qualifications", "Assign faculty to courses"]),
    i("Student Enquiries", "enquiries", "inbox", 3, "CRM for enquiries shared with your institute.", ["Status pipeline", "Internal notes", "Follow-up dates"]),
    i("Purchased Leads", "purchased", "package-check", 3, "Leads you bought and their exports.", ["Allocated leads", "Secure expiring downloads"]),
    i("Demo Bookings", "bookings", "calendar-check", 4, "Demo requests from students.", ["Confirm or reschedule", "Calendar view"]),
    i("Reviews", "reviews", "star", 4, "Moderated student reviews.", ["Respond to reviews", "Report abuse"]),
    i("Analytics", "analytics", "bar-chart-3", 4, "Profile views, enquiries and conversions."),
    i("Lead Packages", "leads", "shopping-cart", 3, "Choose a course, location and package.", ["Eligibility preview", "Razorpay checkout", "Server-verified allocation"]),
    i("Billing and Payments", "billing", "credit-card", 3, "Transactions and invoices.", ["Payment status", "Invoices", "Refund status"]),
    i("Subscription", "subscription", "badge-percent", 4, "Your plan and renewal.", ["Monthly and annual plans", "Upgrade or cancel"]),
    i("Notifications", "notifications", "bell", 4, "Alerts about enquiries and payments."),
    i("Settings", "settings", "settings", 2, "Team members and account settings.", ["Institute members and roles"]),
  ],
  tutor: [
    i("Overview", "dashboard", "layout-dashboard", 2, "Performance and next actions."),
    i("My Profile", "profile", "user", 2, "Your public tutor profile.", ["Headline and about", "Photo upload"]),
    i("Subjects", "subjects", "book-open", 2, "Subjects and education levels you teach."),
    i("Qualifications", "qualifications", "award", 2, "Qualifications and verification documents.", ["Self-reported until reviewed"]),
    i("Experience", "experience", "briefcase", 2, "Teaching experience."),
    i("Service Locations", "locations", "map-pin", 2, "Where you offer home tuition."),
    i("Fees", "fees", "indian-rupee", 2, "Hourly and monthly fees."),
    i("Availability", "availability", "clock", 2, "Weekly availability."),
    i("Demo Bookings", "bookings", "calendar-check", 4, "Demo requests."),
    i("Student Enquiries", "enquiries", "inbox", 3, "Enquiries shared with you."),
    i("Purchased Leads", "leads", "package-check", 3, "Leads you bought and their exports.", ["Package selection", "Secure expiring downloads"]),
    i("Reviews", "reviews", "star", 4, "Moderated reviews."),
    i("Subscription", "subscription", "badge-percent", 4, "Your plan."),
    i("Payments", "billing", "credit-card", 3, "Transactions and invoices."),
    i("Settings", "settings", "settings", 2, "Account settings."),
  ],
  admin: [
    i("Overview", "dashboard", "layout-dashboard", 2, "Platform health and queues."),
    i("Students", "users", "users", 2, "Student accounts (access logged).", ["Search and view minimal fields", "Every view written to audit log"]),
    i("Institutes", "institutes", "building", 2, "All institutes and statuses.", ["Approve, reject or suspend"]),
    i("Tutors", "tutors", "graduation-cap", 2, "All tutors and statuses."),
    i("Institute Verification", "verifications", "badge-check", 2, "Review submitted documents and applications."),
    i("Tutor Verification", "tutor-verifications", "badge-check", 2, "Review tutor credentials."),
    i("Courses", "courses", "book-open", 2, "Manage categories and courses."),
    i("Enquiries", "enquiries", "inbox", 3, "Enquiry oversight with minimal data exposure."),
    i("Lead Inventory", "leads", "database", 3, "Eligible, duplicate and invalid lead pools.", ["Duplicate and invalid handling", "Eligibility rules"]),
    i("Lead Orders", "orders", "package-check", 3, "All lead orders and allocations."),
    i("Payments", "payments", "credit-card", 3, "Payment statuses and webhooks.", ["Signature-verified events only", "Idempotency log"]),
    i("Subscriptions", "subscriptions", "badge-percent", 4, "Plans and subscribers.", ["Configure plans"]),
    i("Refunds", "refunds", "undo-2", 3, "Refund requests and status."),
    i("Reviews", "reviews", "star", 4, "Moderation queue."),
    i("Complaints", "complaints", "flag", 4, "Complaint handling."),
    i("Sponsored Listings", "sponsored", "megaphone", 4, "Labelled sponsored placements.", ["Never alters organic ranking"]),
    i("Analytics", "analytics", "bar-chart-3", 4, "Marketplace analytics."),
    i("Consent Records", "consents", "shield-check", 3, "Consent history and access records."),
    i("Privacy Requests", "privacy", "lock", 4, "Access, correction, deletion and withdrawal requests."),
    i("Audit Logs", "audit-logs", "scroll-text", 2, "Append-only log of sensitive admin actions."),
    i("Platform Settings", "settings", "settings", 2, "Packages, plans and configuration.", ["Lead package prices", "Brand name"]),
  ],
};

export function sectionHref(portal: Portal, item: NavItem) {
  return item.external ? item.slug : `${portalMeta[portal].base}/${item.slug}`;
}
