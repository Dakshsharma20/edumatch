import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice, EmptyState } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DashHeader } from "@/components/dashboard/widgets";
import { WithdrawButton } from "@/components/student/withdraw-button";
import { getCurrentUser } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My enquiries" };

export default async function EnquiriesPage() {
  const db = await getDb();
  const user = db ? await getCurrentUser() : null;
  const actions = <Button asChild size="sm"><Link href="/student/enquiries/new">New enquiry</Link></Button>;
  if (!db) {
    return (<><DashHeader title="My enquiries" actions={actions} /><DemoNotice>Connect MongoDB to save and track enquiries.</DemoNotice></>);
  }
  // Only this student's own enquiries.
  const rows = user ? await col(db).enquiries.find({ studentId: user.id }).sort({ createdAt: -1 }).toArray() : [];
  return (
    <>
      <DashHeader title="My enquiries" description="Each enquiry is shared only while its consent stands." actions={actions} />
      {!rows.length ? (
        <EmptyState icon={MessageSquare} title="No enquiries yet" description="Send an enquiry to be matched with institutes and tutors." />
      ) : (
        <Table>
          <THead><TR><TH>Course</TH><TH>City</TH><TH>Sent</TH><TH>Status</TH><TH>Consent</TH></TR></THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r._id}>
                <TD className="font-medium text-ink">{r.course}</TD><TD>{r.city}</TD><TD>{formatDate(r.createdAt)}</TD>
                <TD><Badge variant={r.status === "valid" ? "success" : "neutral"}>{r.status === "valid" ? "Active" : "Withdrawn"}</Badge></TD>
                <TD>{r.status === "valid" ? <WithdrawButton enquiryId={r._id} /> : "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
