"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { withdrawEnquiryAction } from "@/lib/leads/enquiry-actions";

export function WithdrawButton({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div>
      <Button type="button" size="sm" variant="outline" disabled={pending}
        onClick={() => {
          if (!window.confirm("Withdraw consent for this enquiry? Providers will lose access to it on our platform.")) return;
          start(async () => { const r = await withdrawEnquiryAction(enquiryId); if (r.ok) router.refresh(); else setError(r.error); });
        }}>
        {pending ? "Withdrawing…" : "Withdraw consent"}
      </Button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
