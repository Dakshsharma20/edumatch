import Link from "next/link";
import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { DashHeader } from "@/components/dashboard/widgets";
import { portalMeta, type NavItem, type Portal } from "@/lib/nav";

const stageName: Record<number, string> = {
  2: "Stage 2: Backend",
  3: "Stage 3: Lead marketplace & payments",
  4: "Stage 4: Advanced functionality",
};

/** Honest placeholder for modules that are planned but not yet implemented. */
export function SectionPage({ portal, item }: { portal: Portal; item: NavItem }) {
  return (
    <>
      <DashHeader title={item.label} description={item.description} />
      <StatusBanner tone="warning" title={`Not implemented yet: planned for ${stageName[item.stage]}`}>
        This screen is a labelled placeholder. No data is shown and no actions are available until the backend is connected.
      </StatusBanner>
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-primary-soft p-2 text-primary"><Construction className="size-5" /></span>
          <div>
            <h2 className="font-semibold text-ink">What this module will do</h2>
            {item.capabilities.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">{item.capabilities.map((c) => <li key={c}>{c}</li>)}</ul>
            ) : (
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Badge variant="outline">{portalMeta[portal].title}</Badge>
              <Badge variant="warning">{stageName[item.stage]}</Badge>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-5"><Link href={`${portalMeta[portal].base}/dashboard`}>Back to overview</Link></Button>
      </Card>
    </>
  );
}
