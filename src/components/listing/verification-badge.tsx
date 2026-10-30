import { BadgeCheck, Clock, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/types";

const map: Record<VerificationStatus, { label: string; variant: "success" | "warning" | "neutral"; Icon: typeof BadgeCheck }> = {
  verified: { label: "Verified by admin review", variant: "success", Icon: BadgeCheck },
  pending_review: { label: "Verification pending", variant: "warning", Icon: Clock },
  not_verified: { label: "Not verified", variant: "neutral", Icon: ShieldQuestion },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { label, variant, Icon } = map[status];
  return (
    <Badge variant={variant}>
      <Icon /> {label}
    </Badge>
  );
}

/** Tag placed beside fields to separate admin-verified facts from provider-supplied ones. */
export function SourceTag({ verified = false }: { verified?: boolean }) {
  return verified ? (
    <Badge variant="success">Verified</Badge>
  ) : (
    <Badge variant="outline" title="Supplied by the provider and not independently verified">
      Provider-supplied
    </Badge>
  );
}

export function DemoBadge() {
  return <Badge variant="warning">Demo listing</Badge>;
}
