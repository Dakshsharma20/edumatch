/** Central, configurable brand + site settings. The name is temporary. */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "EduMatch",
  description:
    "Discover trusted coaching institutes and personal tutors based on your goals, budget, location, and learning preferences.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  policyVersion: "draft-0.1",
} as const;
