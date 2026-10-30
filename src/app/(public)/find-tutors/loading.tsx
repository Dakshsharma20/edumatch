import { Container } from "@/components/layout/page-section";
import { Skeleton } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <Container className="grid gap-6 py-8 lg:grid-cols-[18rem_1fr]" aria-busy="true">
      <Skeleton className="hidden h-[40rem] lg:block" />
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </Container>
  );
}
