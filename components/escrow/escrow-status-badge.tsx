import { Badge, BadgeText } from "@/components/ui/badge";
import { EscrowStatus } from "@/types/backend";

const escrowBadgeAction: Record<
  EscrowStatus,
  "warning" | "info" | "success" | "error"
> = {
  awaitingFunds: "warning",
  partiallyFunded: "warning",
  fundLocked: "info",
  sellerReady: "info",
  buyerSubmitted: "info",
  buyerCheckpointsSigned: "info",
  completed: "success",
  refunded: "error",
};

const escrowStatusLabel: Record<EscrowStatus, string> = {
  awaitingFunds: "Awaiting funds",
  partiallyFunded: "Partially funded",
  fundLocked: "Funds locked",
  sellerReady: "Seller ready",
  buyerSubmitted: "Buyer submitted",
  buyerCheckpointsSigned: "Checkpoints signed",
  completed: "Completed",
  refunded: "Refunded",
};

type EscrowStatusBadgeProps = {
  status: EscrowStatus;
};

export function EscrowStatusBadge({ status }: EscrowStatusBadgeProps) {
  return (
    <Badge size='sm' action={escrowBadgeAction[status] ?? "muted"}>
      <BadgeText>{escrowStatusLabel[status] ?? status}</BadgeText>
    </Badge>
  );
}
