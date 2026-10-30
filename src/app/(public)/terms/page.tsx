import type { Metadata } from "next";
import { StatusBanner } from "@/components/ui/feedback";
import { Container, PageHeader } from "@/components/layout/page-section";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of use" />
      <Container className="max-w-3xl space-y-6 py-10">
        <StatusBanner tone="warning" title="Draft outline, not legal advice">
          Placeholder terms for the prototype. Have counsel prepare the final terms before launch.
        </StatusBanner>
        {[
          ["Marketplace role", "The platform helps students discover providers. It does not guarantee outcomes, admissions or results."],
          ["Provider information", "Providers are responsible for the accuracy of their listings. Information not marked verified is supplied by the provider."],
          ["Acceptable use", "No fake listings, fabricated reviews or misuse of enquiry data. Violations lead to suspension."],
          ["Payments", "Provider payments are processed through a payment gateway and confirmed server-side before any service is delivered."],
        ].map(([t, p]) => (
          <section key={t}><h2 className="text-lg font-semibold">{t}</h2><p className="mt-1 text-sm">{p}</p></section>
        ))}
      </Container>
    </>
  );
}
