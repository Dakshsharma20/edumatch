import Link from "next/link";
import { BadgeCheck, Building2, GraduationCap, Users } from "lucide-react";
import { StatusBanner } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/charts/charts";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/widgets";
import { platformMonthly, verificationQueue } from "@/lib/demo/dashboard";

export const metadata = { title: "Overview" };

export default function AdminDashboard() {
  return (
    <>
      <DashHeader title="Admin overview" description="Platform health and review queues." />
      <StatusBanner tone="warning" title="Preview: no access control yet">
        Role checks are added in Stage 2 (server-side session and role lookup). Do not deploy this build publicly.
      </StatusBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value="1,520" icon={Users} delta={9} />
        <StatCard label="Institutes" value="86" icon={Building2} delta={4} />
        <StatCard label="Tutors" value="214" icon={GraduationCap} delta={7} />
        <StatCard label="Pending verifications" value={String(verificationQueue.length)} icon={BadgeCheck} />
      </div>
      <Panel title="Signups and lead orders" description="Last 6 months" demo>
        <TrendChart data={platformMonthly} keys={[{ key: "signups", name: "Signups" }, { key: "orders", name: "Lead orders" }]} />
      </Panel>
      <Panel title="Verification queue" description="Oldest first">
        <Table>
          <THead><TR><TH>ID</TH><TH>Name</TH><TH>Type</TH><TH>Submitted</TH><TH>Status</TH></TR></THead>
          <TBody>
            {verificationQueue.map((v) => (
              <TR key={v.id}><TD>{v.id}</TD><TD className="font-medium text-ink">{v.name}</TD><TD>{v.type}</TD><TD>{v.submitted}</TD><TD><Badge variant="warning">{v.status}</Badge></TD></TR>
            ))}
          </TBody>
        </Table>
        <Link href="/admin/verifications" className="text-sm font-medium text-primary hover:underline">Open verification queue</Link>
      </Panel>
    </>
  );
}
