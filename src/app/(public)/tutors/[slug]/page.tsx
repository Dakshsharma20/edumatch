import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, MessageSquareOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DemoNotice, EmptyState, StatusBanner } from "@/components/ui/feedback";
import { Container } from "@/components/layout/page-section";
import { Avatar } from "@/components/listing/listing-cards";
import { FavouriteToggle } from "@/components/listing/list-actions";
import { RequestDialog } from "@/components/listing/request-dialog";
import { DemoBadge, SourceTag, VerificationBadge } from "@/components/listing/verification-badge";
import { getTutorBySlug, listTutors } from "@/lib/data/listings";
import { formatDate, formatINR } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listTutors()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTutorBySlug(slug);
  if (!t) return { title: "Tutor not found" };
  return {
    title: `${t.name} – ${t.subjects.join(", ")} tutor in ${t.city}`,
    description: t.headline,
    alternates: { canonical: `/tutors/${t.slug}` },
    robots: t.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default async function TutorPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTutorBySlug(slug);
  if (!t) notFound();

  return (
    <>
      <div className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-start justify-between gap-6 py-8">
          <div className="flex items-start gap-4">
            <Avatar name={t.name} tone="secondary" />
            <div>
              <h1 className="text-3xl font-bold">{t.name}</h1>
              <p className="mt-1 text-muted">{t.headline}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="size-4" /> {t.city}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.isDemo && <DemoBadge />}
                <VerificationBadge status={t.verification.status} />
                {t.modes.map((m) => <Badge key={m} variant="outline">{m === "home" ? "Home tuition" : "Online"}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <RequestDialog kind="demo" providerName={t.name} />
            <RequestDialog kind="callback" providerName={t.name} triggerVariant="outline" />
            <FavouriteToggle id={t.slug} size="md" />
          </div>
        </Container>
      </div>

      <Container className="grid gap-8 py-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {t.isDemo && <DemoNotice>This is a fictional tutor profile. Qualifications and fees are sample content.</DemoNotice>}
          <StatusBanner title="How to read this profile">
            <p>{t.verification.note} Details marked <SourceTag /> are self-reported by the tutor.</p>
          </StatusBanner>

          <section>
            <h2 className="mb-3 text-xl font-semibold">About <SourceTag /></h2>
            <p>{t.about}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Qualifications and experience <SourceTag /></h2>
            <ul className="list-inside list-disc space-y-1">{t.qualifications.map((q) => <li key={q}>{q}</li>)}</ul>
            <p className="mt-2 text-sm text-muted">{t.experienceYears} years of teaching experience (self-reported)</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Subjects, classes and languages <SourceTag /></h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div><dt className="text-muted">Subjects</dt><dd className="mt-1 flex flex-wrap gap-1">{t.subjects.map((s) => <Badge key={s} variant="primary">{s}</Badge>)}</dd></div>
              <div><dt className="text-muted">Classes</dt><dd className="mt-1 flex flex-wrap gap-1">{t.levels.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</dd></div>
              <div><dt className="text-muted">Languages</dt><dd className="mt-1 flex flex-wrap gap-1">{t.languages.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Service areas and availability <SourceTag /></h2>
            <p className="text-sm"><strong className="text-ink">Areas:</strong> {t.serviceLocalities.join(", ")}, {t.city}</p>
            <ul className="mt-2 list-inside list-disc text-sm">{t.availability.map((a) => <li key={a}>{a}</li>)}</ul>
            <p className="mt-2 text-xs text-muted">Availability is the tutor’s stated preference, not a live calendar. Confirm slots directly.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
            <EmptyState icon={MessageSquareOff} title="No reviews yet" description="Reviews appear only when real students submit them and they pass moderation." />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-semibold text-ink">Fees <SourceTag /></h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Hourly</dt><dd className="font-semibold text-ink">{formatINR(t.hourlyFeeINR)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Monthly</dt><dd className="font-semibold text-ink">{formatINR(t.monthlyFeeINR)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Demo class</dt><dd>{t.demoAvailable ? "Offered" : "Not offered"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Last updated</dt><dd>{formatDate(t.lastUpdated)}</dd></div>
            </dl>
          </Card>
          <Card className="p-5 text-sm">
            <h2 className="font-semibold text-ink">Contact with your consent</h2>
            <p className="mt-1 text-muted">
              Tutor contact details are never shown publicly. You choose to share yours, and only this tutor receives them.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <RequestDialog kind="contact" providerName={t.name} className="w-full" />
              <RequestDialog kind="report" providerName={t.name} triggerVariant="outline" className="w-full" />
            </div>
          </Card>
        </aside>
      </Container>
    </>
  );
}
