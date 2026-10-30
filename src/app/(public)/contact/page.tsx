import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Container, PageHeader } from "@/components/layout/page-section";
import { ContactForm } from "@/components/marketing/contact-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Contact & support", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact & support" description={`Questions, listing corrections or privacy requests: write to ${siteConfig.supportEmail}.`} />
      <Container className="max-w-2xl py-10">
        <Card className="p-6"><ContactForm /></Card>
      </Container>
    </>
  );
}
