import Link from "next/link";
import { BadgeCheck, CalendarCheck, Eye, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/components/ui/feedback";
import { TrendChart } from "@/components/charts/charts";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/widgets";
import { monthly } from "@/lib/demo/dashboard";

export const metadata = { title: "Overview" };

export default function TutorDashboard() {
  return (
    <>
      <DashHeader title="Tutor overview" description="Ananya Iyer (fictional demo tutor)" actions={<Button asChild><Link href="/tutor/leads">Buy enquiries</Link></Button>} />
      <StatusBanner title="Qualifications: self-reported">Your qualifications show as self-reported until our team verifies your documents.</StatusBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile views" value="320" icon={Eye} delta={8} />
        <StatCard label="Enquiries" value="18" icon={Inbox} delta={12} />
        <StatCard label="Demo requests" value="4" icon={CalendarCheck} />
        <StatCard label="Verification" value="Pending" icon={BadgeCheck} hint="No badge until reviewed" />
      </div>
      <Panel title="Views and enquiries" description="Last 6 months" demo>
        <TrendChart data={monthly} keys={[{ key: "views", name: "Views" }, { key: "enquiries", name: "Enquiries" }]} />
      </Panel>
    </>
  );
}
