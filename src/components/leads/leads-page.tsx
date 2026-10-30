import { Badge } from "@/components/ui/badge";
import { DemoNotice, EmptyState, StatusBanner } from "@/components/ui/feedback";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DashHeader } from "@/components/dashboard/widgets";
import { DownloadButton } from "@/components/leads/purchased-orders";
import { LeadCheckout } from "@/components/leads/lead-checkout";
import { LeadPackagePicker } from "@/components/dashboard/lead-package-picker";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";
import { getCurrentUser } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { demoCities, demoExams } from "@/lib/demo/listings";
import { demoLeadPackages } from "@/lib/demo/pricing";
import { formatDate, formatINR } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

const statusLabel: Record<string, string> = { created: "Awaiting payment", paid: "Paid, allocating", fulfilled: "Delivered", partially_fulfilled: "Partly delivered", failed: "Payment failed", refunded: "Refunded" };

export async function LeadsPage({ audience }: { audience: "institute" | "tutor" }) {
  const db = await getDb();
  const header = <DashHeader title="Lead packages" description="Buy consented student enquiries that match your course and city." />;
  if (!db) {
    return (<>{header}<DemoNotice>Sample packages only. Connect MongoDB and Razorpay (test keys) to buy.</DemoNotice><LeadPackagePicker packages={demoLeadPackages} cities={demoCities} exams={demoExams} /></>);
  }
  const user = await getCurrentUser();
  const [pkgs, orders] = await Promise.all([
    col(db).leadPackages.find({ audience, active: true }).sort({ leadsCount: 1 }).toArray(),
    // Only this user's own orders.
    user ? col(db).leadOrders.find({ buyerUserId: user.id }).sort({ createdAt: -1 }).limit(50).toArray() : Promise.resolve([]),
  ]);
  const packages = pkgs.map((p) => ({ id: p._id, name: p.name, leads: p.leadsCount, pricePaise: p.pricePaise, isDemo: p.isDemo }));
  return (
    <>
      {header}
      {!isRazorpayConfigured() && <StatusBanner tone="warning" title="Payments are not configured">Add Razorpay keys (use TEST keys first) to enable checkout. No payment is simulated.</StatusBanner>}
      {packages.length === 0
        ? <EmptyState icon={ShoppingCart} title="No packages available" description="An administrator has not published any packages yet." />
        : <LeadCheckout packages={packages} cities={demoCities} courses={demoExams} />}
      <h2 className="mt-8 text-lg font-semibold text-ink">Purchased enquiries</h2>
      {!orders.length ? (
        <p className="mt-2 text-sm text-muted">No orders yet.</p>
      ) : (
        <Table>
          <THead><TR><TH>Date</TH><TH>Bought</TH><TH>Delivered</TH><TH>Amount</TH><TH>Status</TH><TH>Export</TH></TR></THead>
          <TBody>
            {orders.map((o) => (
              <TR key={o._id}>
                <TD>{formatDate(o.createdAt)}</TD><TD>{o.quantity}</TD><TD>{o.allocatedCount}</TD><TD>{formatINR(o.amountPaise / 100)}</TD>
                <TD><Badge variant={o.status === "fulfilled" ? "success" : "neutral"}>{statusLabel[o.status] ?? o.status}</Badge></TD>
                <TD>{["fulfilled", "partially_fulfilled"].includes(o.status) ? <DownloadButton orderId={o._id} /> : "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
