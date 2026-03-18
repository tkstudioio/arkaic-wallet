import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { P } from "@/components/ui/typography";

import { useBuyerConfirmCollaborate } from "@/hooks/escrows/use-buyer-confirm-collaborate";
import { useEscrow } from "@/hooks/escrows/use-escrow";
import { usePayEscrow } from "@/hooks/escrows/use-pay-escrow";
import { useRefund } from "@/hooks/escrows/use-refund";
import { useSellerSignCollaborate } from "@/hooks/escrows/use-seller-sign-collaborate";
import useAccountStore from "@/stores/account";
import { Chat } from "@/types/backend";
import { match } from "ts-pattern";
import { HStack } from "../ui/hstack";
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
      <HStack className='w-full' space={"md"}>
        {isBuyer &&
          Date.now() / 1000 > escrow.timelockExpiry &&
          (escrow.status === "fundLocked" ||
            escrow.status === "sellerReady" ||
            escrow.status === "partiallyFunded") && (
            <Button
              variant={"outline"}
              className='w-max'
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
                className='flex-1'
                action='neutral'
                variant='outline'
                disabled
                onPress={() =>
                  payEscrow.mutate({
                    escrowAddress: escrow.address,
                    price: escrow.price,
                    chatId: props.chat.id,
                  })
                }
              >
                <ButtonText>
                  Awaiting payment confirmation <Spinner />
                </ButtonText>
              </Button>
            ) : (
              <P>Awaiting buyer to lock funds</P>
            ),
          )
          .with({ status: "fundLocked" }, () =>
            isBuyer ? (
              <Button
                disabled
                action={"neutral"}
                variant={"outline"}
                className='flex-1'
                onPress={() =>
                  sellerSignCollaborate.mutate({
                    escrowAddress: escrow.address,
                    chatId: props.chat.id,
                  })
                }
              >
                <ButtonText>
                  Awaiting seller <Spinner />
                </ButtonText>
              </Button>
            ) : (
              <Button
                className='flex-1'
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
                className='flex-1'
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
          .with({ status: "completed" }, { status: "refunded" }, () => null)
          .otherwise(({ status }) => (
            <P>{status}</P>
          ))}
      </HStack>
    ))
    .otherwise(() => null);
}
