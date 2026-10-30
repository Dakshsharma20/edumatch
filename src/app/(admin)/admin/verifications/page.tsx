import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice, EmptyState, StatusBanner } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ReviewActions } from "@/components/dashboard/review-actions";
import { DashHeader } from "@/components/dashboard/widgets";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { verificationQueue } from "@/lib/demo/dashboard";
import { formatDate } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

export const metadata = { title: "Verification" };

export default async function VerificationsPage() {
  const db = await getDb();

  if (!db) {
    return (
      <>
        <DashHeader title="Institute & tutor verification" description="Review applications and documents before any verified badge is granted." />
        <DemoNotice>Sample queue. Connect MongoDB to review real applications.</DemoNotice>
        <Table>
          <THead><TR><TH>ID</TH><TH>Applicant</TH><TH>Type</TH><TH>City</TH><TH>Status</TH><TH>Actions</TH></TR></THead>
          <TBody>
            {verificationQueue.map((v) => (
              <TR key={v.id}><TD>{v.id}</TD><TD className="font-medium text-ink">{v.name}</TD><TD>{v.type}</TD><TD>{v.city}</TD><TD><Badge variant="warning">{v.status}</Badge></TD>
                <TD><Button size="sm" disabled title="Needs the database">Approve</Button></TD></TR>
            ))}
          </TBody>
        </Table>
      </>
    );
  }

  // The portal layout already requires the admin role; the sensitive writes re-check it again in the action.
  const c = col(db);
  const insts = await c.institutes.find({ status: "submitted" }).sort({ createdAt: 1 }).toArray();
  const docCounts = await c.verificationDocs.aggregate<{ _id: string; n: number }>([
    { $match: { ownerType: "institute", ownerId: { $in: insts.map((i) => i._id) } } }, { $group: { _id: "$ownerId", n: { $sum: 1 } } },
  ]).toArray();
  const rows = insts.map((i) => ({ id: i._id, name: i.name, city: i.city, created_at: i.createdAt, docs: docCounts.find((d) => d._id === i._id)?.n ?? 0 }));

  return (
    <>
      <DashHeader title="Institute verification" description="Applications waiting for review, oldest first." />
      <StatusBanner title="Every decision is audit-logged">
        Approving publishes the listing and marks it Verified. Document viewing (signed links) is not built yet, so confirm documents out-of-band for now.
      </StatusBanner>
      {!rows.length ? (
        <EmptyState icon={BadgeCheck} title="Nothing to review" description="New institute applications appear here once submitted." />
      ) : (
        <Table>
          <THead><TR><TH>Institute</TH><TH>City</TH><TH>Submitted</TH><TH>Documents</TH><TH>Actions</TH></TR></THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium text-ink">{r.name}</TD><TD>{r.city ?? "—"}</TD><TD>{formatDate(r.created_at)}</TD>
                <TD>{r.docs}</TD>
                <TD><ReviewActions instituteId={r.id} /></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
