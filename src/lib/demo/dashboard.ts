/** FICTIONAL SAMPLE METRICS for dashboard previews. Not real data. */
export const monthly = [
  { label: "May", views: 320, enquiries: 18 },
  { label: "Jun", views: 410, enquiries: 24 },
  { label: "Jul", views: 380, enquiries: 21 },
  { label: "Aug", views: 520, enquiries: 33 },
  { label: "Sep", views: 610, enquiries: 41 },
  { label: "Oct", views: 690, enquiries: 47 },
];

export const platformMonthly = [
  { label: "May", signups: 120, orders: 6 },
  { label: "Jun", signups: 180, orders: 9 },
  { label: "Jul", signups: 210, orders: 11 },
  { label: "Aug", signups: 260, orders: 15 },
  { label: "Sep", signups: 340, orders: 19 },
  { label: "Oct", signups: 410, orders: 24 },
];

export const pipeline = [
  { label: "New", count: 12 },
  { label: "Contacted", count: 9 },
  { label: "Follow-up", count: 5 },
  { label: "Demo booked", count: 4 },
  { label: "Converted", count: 3 },
  { label: "Not interested", count: 6 },
];

export type LeadStatus = "New" | "Contacted" | "Follow-up required" | "Demo booked" | "Admission converted" | "Not interested";

export const crmStatuses: LeadStatus[] = ["New", "Contacted", "Follow-up required", "Demo booked", "Admission converted", "Not interested"];

/** Sample leads "shared with" a demo institute. Contact numbers are masked placeholders. */
export const crmLeads: { id: string; name: string; course: string; city: string; phone: string; status: LeadStatus; followUp: string; note: string }[] = [
  { id: "L-001", name: "Demo Student A", course: "JEE Main & Advanced", city: "Bhopal", phone: "98XXXXXX01", status: "New", followUp: "", note: "" },
  { id: "L-002", name: "Demo Student B", course: "NEET", city: "Bhopal", phone: "97XXXXXX02", status: "Contacted", followUp: "2026-10-30", note: "Parent asked about fees" },
  { id: "L-003", name: "Demo Student C", course: "JEE Main & Advanced", city: "Indore", phone: "99XXXXXX03", status: "Follow-up required", followUp: "2026-10-29", note: "Call after 6 PM" },
  { id: "L-004", name: "Demo Student D", course: "CBSE Board", city: "Bhopal", phone: "96XXXXXX04", status: "Demo booked", followUp: "2026-11-02", note: "Demo on Sunday" },
  { id: "L-005", name: "Demo Student E", course: "NEET", city: "Bhopal", phone: "95XXXXXX05", status: "Admission converted", followUp: "", note: "" },
];

export const verificationQueue = [
  { id: "V-101", name: "Demo Aarambh Classes", type: "Institute", city: "Jaipur", submitted: "2026-10-24", docs: 3, status: "Pending review" },
  { id: "V-102", name: "Demo Gyan Path Institute", type: "Institute", city: "Lucknow", submitted: "2026-10-22", docs: 2, status: "Documents missing" },
  { id: "V-103", name: "Demo Kavya Rao (tutor)", type: "Tutor", city: "Hyderabad", submitted: "2026-10-25", docs: 1, status: "Pending review" },
];

export const auditSample = [
  { when: "2026-10-26 18:02", actor: "admin-demo", action: "Approved verification V-088", target: "Demo Institute" },
  { when: "2026-10-26 16:40", actor: "admin-demo", action: "Changed lead package price", target: "25-lead package" },
  { when: "2026-10-25 11:15", actor: "admin-demo", action: "Suspended listing", target: "Demo Tutor" },
];
