import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, ImageIcon, MapPin, MessageSquareOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice, EmptyState, StatusBanner } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Container } from "@/components/layout/page-section";
import { Avatar } from "@/components/listing/listing-cards";
import { CompareToggle, FavouriteToggle } from "@/components/listing/list-actions";
import { RequestDialog } from "@/components/listing/request-dialog";
import { DemoBadge, SourceTag, VerificationBadge } from "@/components/listing/verification-badge";
import { FaqList } from "@/components/marketing/faq";
import { getInstituteBySlug, listInstitutes } from "@/lib/data/listings";
import { siteConfig } from "@/lib/config";
import { formatDate, formatINR } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listInstitutes()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = await getInstituteBySlug(slug);
  if (!i) return { title: "Institute not found" };
  return {
    title: `${i.name} – ${i.locality}, ${i.city}`,
    description: `${i.tagline}. Courses, fees, batches and faculty (provider-supplied unless marked verified).`,
    alternates: { canonical: `/coaching/${i.slug}` },
    // Demo records must never be indexed.
    robots: i.isDemo ? { index: false, follow: false } : undefined,
  };
}

const anchors = ["About", "Courses", "Faculty", "Facilities", "Reviews", "FAQs"];

export default async function InstitutePage({ params }: Props) {
  const { slug } = await params;
  const i = await getInstituteBySlug(slug);
  if (!i) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: i.name,
    description: i.tagline,
    url: `${siteConfig.url}/coaching/${i.slug}`,
    address: { "@type": "PostalAddress", addressLocality: i.city, addressCountry: "IN" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="border-b border-line bg-surface">
        <Container className="py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="scale-125 origin-top-left mr-3"><Avatar name={i.name} /></div>
              <div>
                <h1 className="text-3xl font-bold">{i.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-muted"><MapPin className="size-4" /> {i.address}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {i.isDemo && <DemoBadge />}
                  <VerificationBadge status={i.verification.status} />
                  {i.categories.map((c) => <Badge key={c} variant="primary">{c}</Badge>)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <RequestDialog kind="demo" providerName={i.name} />
              <RequestDialog kind="callback" providerName={i.name} triggerVariant="outline" />
              <CompareToggle slug={i.slug} size="md" />
              <FavouriteToggle id={i.slug} size="md" />
            </div>
          </div>
          <nav aria-label="On this page" className="mt-6 flex gap-4 overflow-x-auto text-sm">
            {anchors.map((a) => <a key={a} href={`#${a.toLowerCase()}`} className="whitespace-nowrap font-medium text-muted hover:text-primary">{a}</a>)}
          </nav>
        </Container>
      </div>

      <Container className="grid gap-8 py-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {i.isDemo && <DemoNotice>This is a fictional listing. Nothing below is real, and no verification has taken place.</DemoNotice>}

          <StatusBanner tone="info" title="How to read this page">
            <p>
              <SourceTag verified /> marks facts confirmed by our review. <SourceTag /> marks details supplied by the institute that we have not independently checked.
              Status: {i.verification.note}
            </p>
          </StatusBanner>

          <section id="gallery" aria-label="Gallery" className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((n) => (
              <div key={n} className="flex aspect-video items-center justify-center rounded-card border border-dashed border-line-strong bg-canvas text-xs text-muted">
                <ImageIcon className="mr-1 size-4" /> Photo placeholder
              </div>
            ))}
          </section>

          <section id="about">
            <h2 className="mb-3 text-xl font-semibold">About <SourceTag /></h2>
            <p>{i.about}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-muted">Teaching modes</dt><dd className="font-medium capitalize text-ink">{i.modes.join(", ")}</dd></div>
              <div><dt className="text-muted">Languages</dt><dd className="font-medium text-ink">{i.languages.join(", ")}</dd></div>
              <div><dt className="text-muted">Last updated</dt><dd className="font-medium text-ink">{formatDate(i.lastUpdated)}</dd></div>
            </dl>
          </section>

          <section id="courses">
            <h2 className="mb-3 text-xl font-semibold">Courses, fees and batches <SourceTag /></h2>
            <div className="space-y-4">
              {i.courses.map((c) => (
                <Card key={c.id}>
                  <CardHeader>
                    <CardTitle>{c.name}</CardTitle>
                    <p className="text-sm text-muted">{c.level} · {c.durationMonths} months · <span className="capitalize">{c.mode}</span> · batch size {c.batchSize}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Table>
                      <THead><TR><TH>Fee component</TH><TH className="text-right">Amount</TH></TR></THead>
                      <TBody>
                        <TR><TD>Tuition</TD><TD className="text-right">{formatINR(c.tuitionFeeINR)}</TD></TR>
                        <TR><TD>Other fees (registration, material)</TD><TD className="text-right">{formatINR(c.otherFeesINR)}</TD></TR>
                        <TR><TD className="font-semibold text-ink">Total estimated cost</TD><TD className="text-right font-semibold text-ink">{formatINR(c.tuitionFeeINR + c.otherFeesINR)}</TD></TR>
                      </TBody>
                    </Table>
                    <div>
                      <p className="text-sm font-medium text-ink">Batch timings</p>
                      <ul className="mt-1 list-inside list-disc text-sm">{c.batchTimings.map((t) => <li key={t}>{t}</li>)}</ul>
                    </div>
                    <p className="text-sm">{c.demoEnabled ? <Badge variant="success">Demo class offered</Badge> : <Badge>Demo not offered</Badge>}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 rounded-card border border-line bg-surface p-4 text-sm">
              <p className="font-medium text-ink">Refund policy <SourceTag /></p>
              <p className="mt-1">{i.refundPolicy}</p>
            </div>
          </section>

          <section id="faculty">
            <h2 className="mb-3 text-xl font-semibold">Faculty <SourceTag /></h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {i.faculty.map((f) => (
                <Card key={f.id} className="flex items-start gap-3 p-4">
                  <Avatar name={f.name} tone="secondary" />
                  <div className="text-sm">
                    <p className="font-semibold text-ink">{f.name}</p>
                    <p>{f.qualification}</p>
                    <p className="text-muted">{f.experienceYears} years (self-reported) · {f.subjects.join(", ")}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="facilities">
            <h2 className="mb-3 text-xl font-semibold">Facilities <SourceTag /></h2>
            <ul className="flex flex-wrap gap-2">{i.facilities.map((f) => <li key={f}><Badge variant="outline">{f}</Badge></li>)}</ul>
          </section>

          <section id="reviews">
            <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
            <EmptyState icon={MessageSquareOff} title="No reviews yet" description="Ratings and reviews will appear here once real students submit them and they pass moderation. We never display invented reviews." />
          </section>

          <section id="faqs">
            <h2 className="mb-3 text-xl font-semibold">FAQs</h2>
            {i.faqs.length ? <FaqList items={i.faqs} /> : <p className="text-sm text-muted">This institute has not added FAQs yet.</p>}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-semibold text-ink">Location</h2>
            <div className="mt-3 flex aspect-video items-center justify-center rounded-lg border border-dashed border-line-strong bg-canvas px-3 text-center text-xs text-muted">
              Embedded map appears once the address is verified.
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${i.locality}, ${i.city}`)}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open area in Google Maps
              </a>
            </Button>
          </Card>
          <Card className="p-5 text-sm">
            <h2 className="font-semibold text-ink">Interested?</h2>
            <p className="mt-1 text-muted">Your details are shared with this institute only after you consent in the form.</p>
            <div className="mt-3 flex flex-col gap-2">
              <RequestDialog kind="callback" providerName={i.name} className="w-full" />
              <RequestDialog kind="report" providerName={i.name} triggerVariant="outline" className="w-full" />
            </div>
          </Card>
        </aside>
      </Container>
    </>
  );
}
