import type { Metadata } from "next";
import Link from "next/link";
import { GitCompare, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice, EmptyState, StatusBanner } from "@/components/ui/feedback";
import { Container, PageHeader } from "@/components/layout/page-section";
import { VerificationBadge } from "@/components/listing/verification-badge";
import { getInstitutesBySlugs, instituteTotalFee, listInstitutes, maxFacultyExperience } from "@/lib/data/listings";
import { formatINR } from "@/lib/utils";
import type { Institute } from "@/types";

export const metadata: Metadata = {
  title: "Compare coaching institutes",
  description: "Compare up to four coaching institutes side by side on fees, duration, batch size, faculty, mode and refund policy.",
  alternates: { canonical: "/compare" },
  robots: { index: false },
};

const MAX = 4;
const NA = <span className="text-muted">Not provided</span>;

type Row = { label: string; render: (i: Institute) => React.ReactNode };

const rows: Row[] = [
  { label: "Verification status", render: (i) => <VerificationBadge status={i.verification.status} /> },
  { label: "Verified rating", render: (i) => (i.rating ? `★ ${i.rating.average.toFixed(1)} (${i.rating.count})` : <span className="text-muted">No reviews yet</span>) },
  { label: "Course fees (tuition, first course)", render: (i) => (i.courses[0] ? formatINR(i.courses[0].tuitionFeeINR) : NA) },
  { label: "Total estimated cost (first course)", render: (i) => (i.courses[0] ? <strong className="text-ink">{formatINR(instituteTotalFee(i))}</strong> : NA) },
  { label: "Course duration", render: (i) => (i.courses[0] ? `${i.courses[0].durationMonths} months` : NA) },
  { label: "Batch size", render: (i) => (i.courses[0] ? `Up to ${i.courses[0].batchSize}` : NA) },
  { label: "Most experienced faculty", render: (i) => (i.faculty.length ? `${maxFacultyExperience(i)} yrs (self-reported)` : NA) },
  { label: "Teaching mode", render: (i) => <span className="capitalize">{i.modes.join(", ")}</span> },
  { label: "Languages", render: (i) => i.languages.join(", ") },
  { label: "Facilities", render: (i) => (i.facilities.length ? i.facilities.join(", ") : NA) },
  { label: "Demo availability", render: (i) => (i.demoAvailable ? <Badge variant="success">Offered</Badge> : <Badge>Not offered</Badge>) },
  { label: "Refund policy", render: (i) => <span className="text-xs">{i.refundPolicy}</span> },
];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids } = await searchParams;
  const slugs = Array.from(new Set((ids ?? "").split(",").map((s) => s.trim()).filter(Boolean))).slice(0, MAX);
  const selected = await getInstitutesBySlugs(slugs);
  const all = await listInstitutes();
  const available = all.filter((i) => !selected.some((s) => s.slug === i.slug));
  const hrefWith = (list: string[]) => `/compare${list.length ? `?ids=${list.join(",")}` : ""}`;
  const current = selected.map((s) => s.slug);

  return (
    <>
      <PageHeader title="Compare institutes" description={`Select up to ${MAX} institutes. Every institute is shown on the same fields. Order is never influenced by advertising.`} />
      <Container className="space-y-6 py-8">
        {selected.some((i) => i.isDemo) && <DemoNotice>Some institutes here are fictional samples, marked as demo listings.</DemoNotice>}

        {selected.length === 0 ? (
          <EmptyState
            icon={GitCompare}
            title="Nothing to compare yet"
            description="Add institutes from search results or pick from the list below."
            action={<Button asChild><Link href="/find-coaching">Browse institutes</Link></Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">Side-by-side comparison of selected institutes</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="sticky left-0 z-10 w-44 bg-canvas px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted">Feature</th>
                  {selected.map((i) => (
                    <th key={i.id} scope="col" className="min-w-52 px-4 py-3 align-top">
                      <Link href={`/coaching/${i.slug}`} className="font-semibold text-ink hover:text-primary">{i.name}</Link>
                      <p className="text-xs font-normal text-muted">{i.locality}, {i.city}</p>
                      <Link href={hrefWith(current.filter((s) => s !== i.slug))} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline">
                        <X className="size-3" /> Remove
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="sticky left-0 bg-canvas px-4 py-3 text-left text-xs font-medium text-muted">{r.label}</th>
                    {selected.map((i) => <td key={i.id} className="px-4 py-3 align-top">{r.render(i)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected.length > 0 && (
          <StatusBanner title="About these figures">
            <p>Fees, faculty experience and facilities are supplied by each institute unless a listing shows “Verified”. Missing items are shown as “Not provided”, never estimated. AI-written explanations of differences arrive in a later stage.</p>
          </StatusBanner>
        )}

        <section aria-labelledby="add-heading">
          <h2 id="add-heading" className="mb-3 text-lg font-semibold">
            {selected.length >= MAX ? "Comparison is full: remove one to add another" : "Add an institute"}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {available.map((i) => (
              <li key={i.id}>
                {selected.length >= MAX ? (
                  <Button type="button" variant="outline" size="sm" disabled><Plus /> {i.name}</Button>
                ) : (
                  <Button asChild variant="outline" size="sm"><Link href={hrefWith([...current, i.slug])}><Plus /> {i.name}</Link></Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
