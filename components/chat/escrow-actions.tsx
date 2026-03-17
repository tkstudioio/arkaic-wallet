import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import { useBuyerConfirmCollaborate } from "@/hooks/escrows/use-buyer-confirm-collaborate";
import { useEscrow } from "@/hooks/escrows/use-escrow";
import { usePayEscrow } from "@/hooks/escrows/use-pay-escrow";
import { useRefund } from "@/hooks/escrows/use-refund";
import { useSellerSignCollaborate } from "@/hooks/escrows/use-seller-sign-collaborate";
import useAccountStore from "@/stores/account";
import { Chat } from "@/types/backend";
import { match } from "ts-pattern";
import { AutoClaimPayment } from "./auto-claim-payment";

export function EscrowActions(props: { chat: Chat; escrowAddress: string }) {
  const { pubkey } = useAccountStore();

  const escrowQuery = useEscrow(props.escrowAddress);

  const sellerSignCollaborate = useSellerSignCollaborate();
  const buyerConfirmCollaborate = useBuyerConfirmCollaborate();
  const payEscrow = usePayEscrow();
  const refund = useRefund();

  const isBuyer = props.chat.buyerPubkey === pubkey;

  return match(escrowQuery)
    .with({ isSuccess: true }, ({ data: escrow }) => (
      <VStack className='flex-col-reverse'>
        {isBuyer &&
          Date.now() / 1000 > escrow.timelockExpiry &&
          (escrow.status === "fundLocked" ||
            escrow.status === "sellerReady" ||
            escrow.status === "partiallyFunded") && (
            <Button
              onPress={() =>
                refund.mutate({
                  escrowAddress: escrow.address,
                  chatId: props.chat.id,
                })
              }
            >
              <ButtonText>Claim refund</ButtonText>
            </Button>
          )}
        {match(escrow)
          .with({ status: "awaitingFunds" }, () =>
            isBuyer ? (
              <Button
                onPress={() =>
                  payEscrow.mutate({
                    escrowAddress: escrow.address,
                    price: escrow.price,
                    chatId: props.chat.id,
                  })
                }
              >
                {payEscrow.isPending ? (
                  <Spinner />
                ) : (
                  <ButtonText>Pay escrow</ButtonText>
                )}
              </Button>
            ) : (
              <P>Awaiting buyer to lock funds</P>
            ),
          )
          .with({ status: "fundLocked" }, () =>
            isBuyer ? (
              <P>Awaiting seller to confirm</P>
            ) : (
              <Button
                onPress={() =>
                  sellerSignCollaborate.mutate({
                    escrowAddress: escrow.address,
                    chatId: props.chat.id,
                  })
                }
              >
                <ButtonText>Sign collaboration</ButtonText>
              </Button>
            ),
          )
          .with({ status: "sellerReady" }, () =>
            isBuyer ? (
              <Button
                onPress={() =>
                  buyerConfirmCollaborate.mutate({
                    escrowAddress: escrow.address,
                    chatId: props.chat.id,
                  })
                }
              >
                <ButtonText>Sign collaboration</ButtonText>
              </Button>
            ) : (
              <P>Awaiting buyer confirm</P>
            ),
          )
          .with({ status: "buyerCheckpointsSigned" }, () =>
            isBuyer ? (
              <P>Order completed</P>
            ) : (
              <AutoClaimPayment
                escrowAddress={escrow.address}
                chatId={props.chat.id}
              />
            ),
          )
          .otherwise(({ status }) => (
            <P>{status}</P>
          ))}
      </VStack>
    ))
    .otherwise(() => null);
}
