import Link from "next/link";
import { BadgeCheck, Eye, Inbox, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBanner } from "@/components/ui/feedback";
import { SimpleBarChart, TrendChart } from "@/components/charts/charts";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/widgets";
import { monthly, pipeline } from "@/lib/demo/dashboard";

export const metadata = { title: "Overview" };

export default function InstituteDashboard() {
  return (
    <>
      <DashHeader title="Institute overview" description="Demo Vidya Sagar Academy (fictional)" actions={<Button asChild><Link href="/institute/leads">Buy enquiries</Link></Button>} />
      <StatusBanner tone="info" title="Verification: not submitted">
        Complete your profile and documents. A verified badge is granted only after admin review. <Link href="/onboarding" className="font-medium underline">Start onboarding</Link>
      </StatusBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile views" value="690" icon={Eye} delta={13} />
        <StatCard label="Enquiries received" value="47" icon={Inbox} delta={15} />
        <StatCard label="Purchased leads" value="25" icon={PackageCheck} />
        <StatCard label="Verification" value="Pending" icon={BadgeCheck} hint="No badge until reviewed" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Views and enquiries" description="Last 6 months" demo><TrendChart data={monthly} keys={[{ key: "views", name: "Views" }, { key: "enquiries", name: "Enquiries" }]} /></Panel>
        <Panel title="Enquiry pipeline" description="Current status counts" demo><SimpleBarChart data={pipeline.map((p) => ({ label: p.label, count: p.count }))} dataKey="count" name="Enquiries" color="#0f766e" /></Panel>
      </div>
    </>
  );
}
