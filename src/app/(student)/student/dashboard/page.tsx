import Link from "next/link";
import { CalendarCheck, Eye, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/widgets";
import { InstituteCard, TutorCard } from "@/components/listing/listing-cards";
import { listInstitutes, listTutors } from "@/lib/data/listings";

export const metadata = { title: "Overview" };

export default async function StudentDashboard() {
  const [institutes, tutors] = await Promise.all([listInstitutes(2), listTutors(2)]);
  return (
    <>
      <DashHeader
        title="Welcome back"
        description="Your shortlist, enquiries and upcoming demos in one place."
        actions={<Button asChild><Link href="/find-coaching">Find coaching</Link></Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saved listings" value="0" icon={Heart} hint="Saves appear here once accounts connect" />
        <StatCard label="Pending enquiries" value="0" icon={MessageSquare} />
        <StatCard label="Upcoming demos" value="0" icon={CalendarCheck} />
        <StatCard label="Recently viewed" value="0" icon={Eye} />
      </div>

      <Panel title="Recommended institutes" description="Shown from sample listings. Personalised matching based on your preferences arrives with the AI study-match stage." demo>
        <div className="grid gap-4 md:grid-cols-2">{institutes.map((i) => <InstituteCard key={i.id} institute={i} />)}</div>
      </Panel>
      <Panel title="Recommended tutors" demo>
        <div className="grid gap-4 md:grid-cols-2">{tutors.map((t) => <TutorCard key={t.id} tutor={t} />)}</div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Pending enquiries"><EmptyState icon={MessageSquare} title="No enquiries yet" description="When you ask a provider to contact you, the enquiry and its consent appear here." /></Panel>
        <Panel title="Upcoming demos"><EmptyState icon={CalendarCheck} title="No demos booked" description="Request a demo from any listing." /></Panel>
      </div>
    </>
  );
}
