import type { Metadata } from "next";
import { InfoPage } from "@/components/marketing/info-page";

export const metadata: Metadata = { title: "How it works", alternates: { canonical: "/how-it-works" } };

export default function Page() {
  return (
    <InfoPage
      title="How it works"
      description="From search to demo class, you stay in control of who sees your details."
      cta={{ href: "/find-coaching", label: "Find Coaching" }}
      blocks={[
        { title: "1. Search and filter", text: "Choose your exam or subject, city, budget and learning mode. Results come from provider profiles, labelled as verified or provider-supplied." },
        { title: "2. Compare", text: "Compare up to four institutes on the same fields. Missing data is shown as missing, and advertising never changes the order." },
        { title: "3. Connect with consent", points: ["Tell us what contact you want", "See exactly which provider receives your details and why", "Withdraw consent or request deletion later"] },
        { title: "4. Book a demo and decide", text: "Request a demo class or callback. The provider confirms timing with you directly." },
      ]}
    />
  );
}
