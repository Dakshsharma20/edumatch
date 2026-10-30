import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoNotice, EmptyState } from "@/components/ui/feedback";
import { Container, PageHeader } from "@/components/layout/page-section";
import { TutorCard } from "@/components/listing/listing-cards";
import { FiltersShell } from "@/components/search/filter-form";
import { ActiveChips, Pagination, SortSelect } from "@/components/search/search-bits";
import { searchTutors } from "@/lib/data/listings";
import { demoCities, demoSubjects, languagesList, levels } from "@/lib/demo/listings";
import { parseTutorParams, type RawParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Find personal tutors",
  description: "Search personal tutors in India by subject, city, fee, language and online or home tuition.",
  alternates: { canonical: "/find-tutors" },
};

export default async function FindTutorsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams;
  const result = await searchTutors(parseTutorParams(sp));
  const values = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? "") : (v ?? "")]));

  return (
    <>
      <PageHeader title="Find personal tutors" description="One-to-one tuition online or at home. Qualifications are self-reported unless marked verified." />
      <Container className="grid gap-6 py-8 lg:grid-cols-[18rem_1fr]">
        <FiltersShell
          kind="tutors"
          basePath="/find-tutors"
          values={values}
          options={{ cities: demoCities, exams: demoSubjects, levels, languages: languagesList }}
        />
        <div className="min-w-0 space-y-4">
          {result.items.some((t) => t.isDemo) && <DemoNotice>Sample profiles only. No tutor marked “Demo listing” is real or verified.</DemoNotice>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-body" aria-live="polite">
              <strong className="text-ink">{result.total}</strong> {result.total === 1 ? "tutor" : "tutors"} found
            </p>
            <SortSelect basePath="/find-tutors" />
          </div>
          <ActiveChips params={sp} basePath="/find-tutors" />
          {result.items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No tutors match these filters"
              description="Try a different subject or city, or remove a filter."
              action={<Button asChild variant="outline"><Link href="/find-tutors">Clear all filters</Link></Button>}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {result.items.map((t) => <TutorCard key={t.id} tutor={t} />)}
            </div>
          )}
          <Pagination page={result.page} totalPages={result.totalPages} params={sp} basePath="/find-tutors" />
        </div>
      </Container>
    </>
  );
}
