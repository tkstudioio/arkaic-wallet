import { Button, ButtonText } from "@/components/ui/button";
import { P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useBuyerConfirmCollaborate } from "@/hooks/escrows/use-buyer-confirm-collaborate";
import { useCheckPayment } from "@/hooks/escrows/use-check-payment";
import { useEscrow } from "@/hooks/escrows/use-escrow";
import { useRefund } from "@/hooks/escrows/use-refund";
import { useSellerSignCheckpoints } from "@/hooks/escrows/use-seller-sign-checkpoints";
import { useSellerSignCollaborate } from "@/hooks/escrows/use-seller-sign-collaborate";
import useAccountStore from "@/stores/account";
import { Escrow } from "@/types/backend";
import { match } from "ts-pattern";
import { AmountComponent } from "../amount";
import { Card } from "../ui/card";
import { EscrowStatusBadge } from "./escrow-status-badge";

type EscrowCardProps = {
  escrowAddress: string;
  chatId: number;
};

export function EscrowCard({ escrowAddress, chatId }: EscrowCardProps) {
  const escrowQuery = useEscrow(escrowAddress);
  const checkPaymentQuery = useCheckPayment(escrowAddress);

  console.log(checkPaymentQuery.data);
  const { pubkey } = useAccountStore();

  const sellerSignCollaborate = useSellerSignCollaborate();
  const buyerConfirmCollaborate = useBuyerConfirmCollaborate();
  const sellerSignCheckpoints = useSellerSignCheckpoints();
  const refund = useRefund();

  return match(escrowQuery)
    .with({ isSuccess: true }, ({ data: escrow }) => {
      const isBuyer = escrow.buyerPubkey === pubkey;
      const isSeller = escrow.sellerPubkey === pubkey;
      const isTimelockExpired = Date.now() / 1000 > escrow.timelockExpiry;

      return (
        <Card>
          <VStack space='md'>
            <EscrowStatusBadge status={escrow.status} />
            <AmountComponent size='lg' amount={escrow.price} />

            {match(escrow.status)
              .with("awaitingFunds", () =>
                isBuyer ? <P>Devi pagare</P> : null,
              )
              .with("fundLocked", () =>
                isSeller ? <P>Devi accettare</P> : null,
              )
              .otherwise(() => null)}

            <EscrowActions
              escrow={escrow}
              chatId={chatId}
              isBuyer={isBuyer}
              isSeller={isSeller}
              isTimelockExpired={isTimelockExpired}
              onSellerRelease={() =>
                sellerSignCollaborate.mutate({
                  escrowAddress: escrow.address,
                  chatId,
                })
              }
              onBuyerConfirm={() =>
                buyerConfirmCollaborate.mutate({
                  escrowAddress: escrow.address,
                  chatId,
                })
              }
              onSellerFinalize={() =>
                sellerSignCheckpoints.mutate({
                  escrowAddress: escrow.address,
                  chatId,
                })
              }
              onRefund={() =>
                refund.mutate({ escrowAddress: escrow.address, chatId })
              }
            />
          </VStack>
        </Card>
      );
    })
    .with({ isLoading: true }, () => <P>Loading</P>)
    .with({ isError: true }, () => <P>Error</P>)
    .otherwise(() => <P>Addio</P>);
}

type EscrowActionsProps = {
  escrow: Escrow;
  chatId: number;
  isBuyer: boolean;
  isSeller: boolean;
  isTimelockExpired: boolean;
  onSellerRelease: () => void;
  onBuyerConfirm: () => void;
  onSellerFinalize: () => void;
  onRefund: () => void;
};

function EscrowActions({
  escrow,
  isBuyer,
  isSeller,
  isTimelockExpired,

  onSellerRelease,
  onBuyerConfirm,
  onSellerFinalize,
  onRefund,
}: EscrowActionsProps) {
  switch (escrow.status) {
    case "awaitingFunds":
      if (!isBuyer) return;
      return <Small>Waiting for buyer to fund...</Small>;

    case "fundLocked":
      if (isSeller) {
        return (
          <Button onPress={onSellerRelease}>
            {<ButtonText>Release funds</ButtonText>}
          </Button>
        );
      }
      if (isBuyer && isTimelockExpired) {
        return (
          <VStack space='sm'>
            <P>Waiting for seller...</P>
            <Button action='negative' onPress={onRefund}>
              <ButtonText>Request refund</ButtonText>
            </Button>
          </VStack>
        );
      }
      return <Small>Waiting for seller to release...</Small>;

    case "sellerReady":
      if (isBuyer) {
        return (
          <Button onPress={onBuyerConfirm}>
            <ButtonText>Confirm purchase</ButtonText>
          </Button>
        );
      }
      return <Small>Waiting for buyer to confirm...</Small>;

    case "buyerSubmitted":
      return <Small>Processing...</Small>;

    case "buyerCheckpointsSigned":
      if (isSeller) {
        return (
          <Button onPress={onSellerFinalize}>
            <ButtonText>Finalize</ButtonText>
          </Button>
        );
      }
      return <Small>Waiting for seller to finalize...</Small>;

    case "completed":
      return <P className='text-success-500'>Escrow completed</P>;

    case "refunded":
      return <P className='text-error-500'>Escrow refunded</P>;

    default:
      return null;
  }
}
