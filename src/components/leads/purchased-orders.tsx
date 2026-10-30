"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { getLeadDownloadLink } from "@/lib/leads/actions";

export function DownloadButton({ orderId }: { orderId: string }) {
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div>
      <Button size="sm" variant="outline" disabled={pending}
        onClick={() => start(async () => { const r = await getLeadDownloadLink(orderId); if (r.ok) window.location.assign(r.url); else setError(r.error); })}>
        {pending ? "Preparing…" : "Download CSV"}
      </Button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
