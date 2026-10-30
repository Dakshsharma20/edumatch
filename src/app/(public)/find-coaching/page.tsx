import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoNotice, EmptyState } from "@/components/ui/feedback";
import { Container, PageHeader } from "@/components/layout/page-section";
import { InstituteCard } from "@/components/listing/listing-cards";
import { FiltersShell } from "@/components/search/filter-form";
import { ActiveChips, Pagination, SortSelect } from "@/components/search/search-bits";
import { searchInstitutes } from "@/lib/data/listings";
import { demoCities, demoExams, languagesList, levels } from "@/lib/demo/listings";
import { parseInstituteParams, type RawParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Find coaching institutes",
  description: "Search and filter coaching institutes in India by course, city, budget, mode, language and more.",
  alternates: { canonical: "/find-coaching" },
};

export default async function FindCoachingPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams;
  const filters = parseInstituteParams(sp);
  const result = await searchInstitutes(filters);
  const values = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? "") : (v ?? "")]));

  return (
    <>
      <PageHeader title="Find coaching institutes" description="Filter by course, city, budget and learning mode. Fees and details are supplied by providers unless marked verified." />
      <Container className="grid gap-6 py-8 lg:grid-cols-[18rem_1fr]">
        <FiltersShell
          kind="coaching"
          basePath="/find-coaching"
          values={values}
          options={{ cities: demoCities, exams: demoExams, levels, languages: languagesList }}
        />
        <div className="min-w-0 space-y-4">
          {result.items.some((i) => i.isDemo) && <DemoNotice>Sample listings only. No institute marked “Demo listing” is real or verified.</DemoNotice>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-body" aria-live="polite">
              <strong className="text-ink">{result.total}</strong> {result.total === 1 ? "institute" : "institutes"} found
            </p>
            <SortSelect basePath="/find-coaching" />
          </div>
          <ActiveChips params={sp} basePath="/find-coaching" />
          {result.items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No institutes match these filters"
              description="Try widening your budget, choosing another city, or removing a filter. We never fill gaps with made-up results."
              action={<Button asChild variant="outline"><Link href="/find-coaching">Clear all filters</Link></Button>}
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {result.items.map((i) => <InstituteCard key={i.id} institute={i} />)}
            </div>
          )}
          <Pagination page={result.page} totalPages={result.totalPages} params={sp} basePath="/find-coaching" />
        </div>
      </Container>
    </>
  );
}
