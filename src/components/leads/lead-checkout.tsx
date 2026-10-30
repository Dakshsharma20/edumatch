"use client";

import * as React from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/form-controls";
import { StatusBanner } from "@/components/ui/feedback";
import { createLeadOrder, verifyLeadPayment } from "@/lib/leads/actions";
import { cn, formatINR } from "@/lib/utils";

interface Pkg { id: string; name: string; leads: number; pricePaise: number; isDemo: boolean }
interface RzResponse { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } } }

export function LeadCheckout({ packages, cities, courses }: { packages: Pkg[]; cities: string[]; courses: string[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState(packages[0]?.id ?? "");
  const [course, setCourse] = React.useState(courses[0] ?? "");
  const [city, setCity] = React.useState(cities[0] ?? "");
  const [mode, setMode] = React.useState("");
  const [msg, setMsg] = React.useState<{ tone: "info" | "warning"; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const pkg = packages.find((p) => p.id === selected);

  async function pay() {
    setMsg(null); setBusy(true);
    const o = await createLeadOrder({ packageId: selected, course, city, mode: mode || undefined });
    if (!o.ok) { setBusy(false); setMsg({ tone: "warning", text: o.error }); return; }
    if (!window.Razorpay) { setBusy(false); setMsg({ tone: "warning", text: "Payment window could not load. You have not been charged." }); return; }
    const rz = new window.Razorpay({
      key: o.keyId, amount: o.amountPaise, currency: "INR", order_id: o.razorpayOrderId, name: "Lead package", description: o.description,
      handler: async (r: RzResponse) => {
        const v = await verifyLeadPayment({ razorpayOrderId: r.razorpay_order_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
        setBusy(false);
        if (!v.ok) setMsg({ tone: "warning", text: v.error });
        else if (v.status === "processing") setMsg({ tone: "info", text: "Payment received and being confirmed. Your enquiries will appear in Purchased enquiries shortly." });
        else { setMsg({ tone: "info", text: "Payment verified. Your enquiries are ready below." }); router.refresh(); }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rz.on("payment.failed", () => { setBusy(false); setMsg({ tone: "warning", text: "Payment failed. You can try again; nothing was allocated." }); });
    rz.open();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-5 lg:col-span-2">
        <Card className="p-5">
          <h2 className="font-semibold text-ink">1. Targeting</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Course or subject" htmlFor="lc-course"><Select id="lc-course" value={course} onChange={(e) => setCourse(e.target.value)}>{courses.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Target city" htmlFor="lc-city"><Select id="lc-city" value={city} onChange={(e) => setCity(e.target.value)}>{cities.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Learning mode" htmlFor="lc-mode"><Select id="lc-mode" value={mode} onChange={(e) => setMode(e.target.value)}><option value="">Any</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></Select></Field>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-ink">2. Choose a package</h2>
          <div role="radiogroup" aria-label="Lead package" className="mt-3 grid gap-3 sm:grid-cols-2">
            {packages.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={selected === p.id} onClick={() => setSelected(p.id)}
                className={cn("rounded-lg border p-4 text-left", selected === p.id ? "border-primary bg-primary-soft" : "border-line-strong hover:bg-canvas")}>
                <span className="block text-lg font-bold text-ink">{p.leads} enquiries</span>
                <span className="text-sm">{formatINR(p.pricePaise / 100)}{p.isDemo && <span className="text-xs text-muted"> (sample price)</span>}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Card className="h-fit p-5">
        <h2 className="font-semibold text-ink">3. Pay</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
          <li>Only enquiries with active consent</li>
          <li>Exact course and city match</li>
          <li>Never an enquiry you already own</li>
          <li>Each enquiry goes to at most 3 providers</li>
        </ul>
        <p className="mt-3 text-xs text-muted">If fewer matching enquiries exist than you paid for, you receive what is available and the shortfall is flagged for the team to credit or refund. Nothing is allocated until payment is verified on our server.</p>
        <p className="mt-4 text-2xl font-bold text-ink">{pkg ? formatINR(pkg.pricePaise / 100) : "—"}</p>
        <Button className="mt-3 w-full" disabled={busy || !pkg} onClick={pay}>{busy ? "Processing…" : "Pay with Razorpay"}</Button>
        {msg && <div className="mt-3"><StatusBanner tone={msg.tone === "warning" ? "warning" : undefined} title={msg.text} /></div>}
      </Card>
    </div>
  );
}
