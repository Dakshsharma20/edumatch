import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/info-page";

export const metadata: Metadata = { title: "For coaching institutes", alternates: { canonical: "/for-institutes" } };

export default function Page() {
  return (
    <InfoPage
      title="List your coaching institute"
      description="Reach students actively searching for coaching, with consented enquiries and a profile you control."
      cta={{ href: "/onboarding", label: "Start institute onboarding" }}
      blocks={[
        { title: "Your own dashboard", points: ["Institute profile, courses and batches", "Faculty management", "Enquiry CRM with notes and follow-ups"] },
        { title: "Consent-based enquiries", text: "Enquiries reach you only when a student has agreed to share their details with you. You only ever see leads shared with your institute." },
        { title: "Verification review", text: "Submit documents and our team reviews them. A verified badge is granted only after review, never automatically." },
        { title: "Honest marketplace", text: "Sponsored placements are labelled and never change organic comparison results." },
      ]}
    />
  );
}
