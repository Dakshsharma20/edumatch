import { DemoNotice, EmptyState, StatusBanner } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashHeader } from "@/components/dashboard/widgets";
import { WithdrawButton } from "@/components/student/withdraw-button";
import { getCurrentUser } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { formatDate } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Privacy and consent" };

const purposeLabel: Record<string, string> = { lead_marketplace: "Share enquiry with providers", direct_contact: "Direct contact", marketing: "Marketing updates" };

export default async function PrivacyPage() {
  const db = await getDb();
  if (!db) return (<><DashHeader title="Privacy and consent" /><DemoNotice>Connect MongoDB to see your consent records.</DemoNotice></>);
  const user = await getCurrentUser();
  // Only this student's own consent records.
  const rows = user ? await col(db).consents.find({ studentId: user.id }).sort({ createdAt: -1 }).toArray() : [];
  return (
    <>
      <DashHeader title="Privacy and consent" description="Every consent you have given, with when and under which policy version." />
      <StatusBanner title="Withdrawing stops future sharing">
        Providers lose access to the enquiry on our platform. A provider that already downloaded your details may still hold them. Contact support to request deletion. Access, correction and deletion requests are not built yet.
      </StatusBanner>
      {!rows.length ? (
        <EmptyState icon={ShieldCheck} title="No consent records" description="Consent is recorded when you send an enquiry." />
      ) : (
        <Table>
          <THead><TR><TH>Purpose</TH><TH>Given</TH><TH>Policy</TH><TH>Status</TH><TH>Action</TH></TR></THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r._id}>
                <TD className="font-medium text-ink">{purposeLabel[r.purpose] ?? r.purpose}</TD><TD>{formatDate(r.createdAt)}</TD><TD>{r.policyVersion}</TD>
                <TD>{r.withdrawnAt ? <Badge variant="neutral">Withdrawn {formatDate(r.withdrawnAt!)}</Badge> : <Badge variant="success">Active</Badge>}</TD>
                <TD>{!r.withdrawnAt && r.enquiryId ? <WithdrawButton enquiryId={r.enquiryId} /> : "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
