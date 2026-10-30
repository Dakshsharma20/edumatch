import type { Metadata } from "next";
import { StatusBanner } from "@/components/ui/feedback";
import { Container, PageHeader } from "@/components/layout/page-section";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy policy" description={`Policy version: ${siteConfig.policyVersion}`} />
      <Container className="max-w-3xl space-y-6 py-10">
        <StatusBanner tone="warning" title="Draft outline, not legal advice">
          This page is a product placeholder. It must be reviewed by qualified counsel against India’s applicable data protection law before launch.
        </StatusBanner>
        {[
          ["What we intend to collect", "Only what is needed: account details, search preferences, and enquiry details you choose to submit."],
          ["Consent", "Contact details are shared with a specific institute or tutor only after your explicit, purpose-specific consent. Marketing consent is separate and off by default."],
          ["Children", "For students under 18, parent or guardian consent is required before enquiry details are processed or shared."],
          ["Your rights", "You can request access, correction, consent withdrawal and deletion from your account’s Privacy & Consent area or by contacting support."],
          ["Retention", "Retention periods will be defined and enforced before launch."],
        ].map(([t, p]) => (
          <section key={t}><h2 className="text-lg font-semibold">{t}</h2><p className="mt-1 text-sm">{p}</p></section>
        ))}
      </Container>
    </>
  );
}
