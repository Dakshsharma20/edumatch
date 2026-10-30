import { Badge } from "@/components/ui/badge";
import { DemoNotice } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DashHeader } from "@/components/dashboard/widgets";
import { crmLeads, crmStatuses, type LeadStatus } from "@/lib/demo/dashboard";

export const metadata = { title: "Student enquiries" };

const tone: Record<LeadStatus, "primary" | "neutral" | "warning" | "secondary" | "success" | "danger"> = {
  New: "primary", Contacted: "neutral", "Follow-up required": "warning", "Demo booked": "secondary", "Admission converted": "success", "Not interested": "danger",
};

export default function InstituteEnquiries() {
  return (
    <>
      <DashHeader title="Student enquiries" description="Only enquiries a student has chosen to share with your institute appear here." />
      <DemoNotice>Sample CRM rows with masked numbers. Editing notes, status and follow-ups is enabled in the lead-marketplace stage.</DemoNotice>
      <ul className="flex flex-wrap gap-2" aria-label="Pipeline stages">
        {crmStatuses.map((s) => (
          <li key={s}><Badge variant={tone[s]}>{s} · {crmLeads.filter((l) => l.status === s).length}</Badge></li>
        ))}
      </ul>
      <Table>
        <THead><TR><TH>ID</TH><TH>Student</TH><TH>Course</TH><TH>City</TH><TH>Contact</TH><TH>Status</TH><TH>Follow-up</TH><TH>Internal note</TH></TR></THead>
        <TBody>
          {crmLeads.map((l) => (
            <TR key={l.id}>
              <TD>{l.id}</TD><TD className="font-medium text-ink">{l.name}</TD><TD>{l.course}</TD><TD>{l.city}</TD>
              <TD>{l.phone}</TD><TD><Badge variant={tone[l.status]}>{l.status}</Badge></TD>
              <TD>{l.followUp || "—"}</TD><TD>{l.note || "—"}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  );
}
