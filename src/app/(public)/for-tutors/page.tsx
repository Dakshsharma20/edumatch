import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/info-page";

export const metadata: Metadata = { title: "For personal tutors", alternates: { canonical: "/for-tutors" } };

export default function Page() {
  return (
    <InfoPage
      title="Join as a personal tutor"
      description="Build a professional profile and receive consented tuition enquiries from nearby students."
      cta={{ href: "/onboarding", label: "Create tutor profile" }}
      blocks={[
        { title: "Your tutor portal", points: ["Subjects, levels and service areas", "Hourly and monthly fees", "Availability and demo requests"] },
        { title: "Private by design", text: "You see only your own data. Other tutors, and other institutes, can never access it." },
        { title: "Consented enquiries", text: "Purchase eligible enquiries from students who agreed to share details with tutors like you." },
        { title: "Credentials stay honest", text: "Qualifications are shown as self-reported until our team verifies them." },
      ]}
    />
  );
}
