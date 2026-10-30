/**
 * SAMPLE PRICING. Every number is a placeholder for UI preview.
 * In Stage 3 these come from the admin-configurable `lead_packages` and `subscription_plans` tables.
 */
export const demoLeadPackages = [
  { id: "lp-10", leads: 10, priceINR: 1500 },
  { id: "lp-25", leads: 25, priceINR: 3500 },
  { id: "lp-50", leads: 50, priceINR: 6500 },
  { id: "lp-100", leads: 100, priceINR: 12000 },
];

export const demoPlans = [
  { id: "plan-inst-m", audience: "Institute", name: "Institute Monthly", interval: "month", priceINR: 2499, features: ["Verified-review eligible profile", "Course & batch management", "Enquiry CRM", "Analytics"] },
  { id: "plan-inst-y", audience: "Institute", name: "Institute Annual", interval: "year", priceINR: 24990, features: ["Everything in Monthly", "Two months free (sample)", "Priority review queue"] },
  { id: "plan-tutor-m", audience: "Tutor", name: "Tutor Monthly", interval: "month", priceINR: 499, features: ["Tutor profile", "Demo requests", "Enquiry tracking"] },
];
