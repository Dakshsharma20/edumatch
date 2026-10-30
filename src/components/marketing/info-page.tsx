import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, PageHeader } from "@/components/layout/page-section";

export function InfoPage({
  title,
  description,
  blocks,
  cta,
}: {
  title: string;
  description: string;
  blocks: { title: string; text?: string; points?: string[] }[];
  cta?: { href: string; label: string };
}) {
  return (
    <>
      <PageHeader title={title} description={description}>
        {cta && <Button asChild size="lg" className="mt-6"><Link href={cta.href}>{cta.label}</Link></Button>}
      </PageHeader>
      <Container className="grid gap-5 py-10 md:grid-cols-2">
        {blocks.map((b) => (
          <Card key={b.title} className="p-6">
            <h2 className="text-lg font-semibold">{b.title}</h2>
            {b.text && <p className="mt-2 text-sm">{b.text}</p>}
            {b.points && (
              <ul className="mt-3 space-y-2 text-sm">
                {b.points.map((p) => (
                  <li key={p} className="flex gap-2"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-secondary" />{p}</li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </Container>
    </>
  );
}
