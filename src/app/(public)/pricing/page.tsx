import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/feedback";
import { Container, PageHeader } from "@/components/layout/page-section";
import { demoLeadPackages, demoPlans } from "@/lib/demo/pricing";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing", alternates: { canonical: "/pricing" } };

export default function PricingPage() {
  return (
    <>
      <PageHeader title="Pricing for providers" description="Students never pay to search, compare or enquire. Providers choose a subscription and may buy consented enquiries." />
      <Container className="space-y-10 py-10">
        <DemoNotice>All prices below are sample placeholders. Real prices will be set in the admin panel before launch.</DemoNotice>
        <section>
          <h2 className="mb-4 text-xl font-semibold">Subscriptions (sample)</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {demoPlans.map((p) => (
              <Card key={p.id} className="flex flex-col p-6">
                <p className="text-xs font-semibold uppercase text-secondary">{p.audience}</p>
                <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
                <p className="mt-2 text-3xl font-bold text-ink">{formatINR(p.priceINR)}<span className="text-sm font-normal text-muted"> / {p.interval}</span></p>
                <ul className="mt-4 flex-1 list-inside list-disc space-y-1 text-sm">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <Button disabled className="mt-5" title="Payments are connected in a later stage">Checkout not live yet</Button>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-xl font-semibold">Consented enquiry packages (sample)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoLeadPackages.map((p) => (
              <Card key={p.id} className="p-5">
                <p className="text-2xl font-bold text-ink">{p.leads} enquiries</p>
                <p className="mt-1 text-lg">{formatINR(p.priceINR)}</p>
                <p className="mt-1 text-xs text-muted">{formatINR(Math.round(p.priceINR / p.leads))} per enquiry (sample)</p>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">Only enquiries with valid consent, matching your course, location and mode are eligible. Eligibility is explained before you pay.</p>
        </section>
      </Container>
    </>
  );
}
