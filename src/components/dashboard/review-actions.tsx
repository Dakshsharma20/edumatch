"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { decideInstitute } from "@/lib/admin/actions";

export function ReviewActions({ instituteId }: { instituteId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const act = (d: "approve" | "reject") => {
    if (d === "approve" && !window.confirm("Approve publishes the listing and marks it Verified. Confirm you have reviewed the documents.")) return;
    startTransition(async () => {
      const res = await decideInstitute(instituteId, d);
      if (res.ok) { setError(null); router.refresh(); } else setError(res.error);
    });
  };
  return (
    <div>
      <div className="flex gap-2">
        <Button size="sm" disabled={pending} onClick={() => act("approve")}>Approve</Button>
        <Button size="sm" variant="outline" disabled={pending} onClick={() => act("reject")}>Reject</Button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
