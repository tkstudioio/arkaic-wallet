import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import { useChatEscrow } from "@/hooks/chats/use-chat-escrow";
import { useChatOffer } from "@/hooks/chats/use-chat-offer";
import { useBuyerConfirmCollaborate } from "@/hooks/escrows/use-buyer-confirm-collaborate";
import { useEscrow } from "@/hooks/escrows/use-escrow";
import { usePayEscrow } from "@/hooks/escrows/use-pay-escrow";
import { useRefund } from "@/hooks/escrows/use-refund";
import { useSellerSignCheckpoints } from "@/hooks/escrows/use-seller-sign-checkpoints";
import { useSellerSignCollaborate } from "@/hooks/escrows/use-seller-sign-collaborate";
import { useSendMessage } from "@/hooks/messages/use-send-message";
import useAccountStore from "@/stores/account";
import { Chat, Offer } from "@/types/backend";
import { Send } from "lucide-react-native";
import { useState } from "react";
import { match } from "ts-pattern";
import { AmountComponent } from "../amount";
import { BuyListing } from "../listing/buy-listing";
import { CreateOffer } from "./create-offer";
import { SellerOfferActions } from "./seller-offer-actions";

export function SendMessage(props: {
  chat: Chat;
  activeOffer: Offer | null;
  escrowAddress?: string | null;
}) {
  const sendMessageMutation = useSendMessage();
  const [message, setMessage] = useState<string>("");
  const chatEscrowQuery = useChatEscrow(props.chat.id);

  return (
    <Card>
      <VStack space={"md"}>
        <HStack space={"md"}>
          {chatEscrowQuery.data ? (
            <EscrowActions
              chat={props.chat}
              escrowAddress={chatEscrowQuery.data.address}
            />
          ) : (
            <OfferActions chat={props.chat} />
          )}
        </HStack>

        <HStack space={"md"}>
          <Input className='flex-1 h-full'>
            <InputField
              placeholder='Type message...'
              value={message}
              onChangeText={setMessage}
            />
          </Input>
          <Button
            className='w-max'
            isDisabled={message.length < 1}
            onPress={() => {
              sendMessageMutation.mutate(
                {
                  message,
                  chatId: props.chat.id,
                },
                { onSuccess: () => setMessage("") },
              );
            }}
          >
            {sendMessageMutation.isPending ? (
              <Spinner />
            ) : (
              <ButtonIcon as={Send} />
            )}
          </Button>
        </HStack>
      </VStack>
    </Card>
  );
}

function EscrowActions(props: { chat: Chat; escrowAddress: string }) {
  const { pubkey } = useAccountStore();

  const escrowQuery = useEscrow(props.escrowAddress);

  const sellerSignCollaborate = useSellerSignCollaborate();
  const buyerConfirmCollaborate = useBuyerConfirmCollaborate();
  const sellerSignCheckpoints = useSellerSignCheckpoints();
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
              <Button
                onPress={() =>
                  sellerSignCheckpoints.mutate({
                    escrowAddress: escrow.address,
                    chatId: props.chat.id,
                  })
                }
              >
                <ButtonText>Claim payment</ButtonText>
              </Button>
            ),
          )
          .otherwise(({ status }) => (
            <P>{status}</P>
          ))}
      </VStack>
    ))
    .otherwise(() => null);
}

function OfferActions(props: { chat: Chat }) {
  const { pubkey } = useAccountStore();
  const chatOfferQuery = useChatOffer(props.chat.id);

  const isBuyer = props.chat.buyerPubkey === pubkey;

  return chatOfferQuery.data ? (
    isBuyer ? (
      chatOfferQuery.data.acceptance ? (
        <>
          {chatOfferQuery.data.acceptance.accepted ? (
            <AmountComponent amount={chatOfferQuery.data.price} size='4xl' />
          ) : (
            <CreateOffer chat={props.chat} />
          )}
          <BuyListing
            chat={props.chat}
            price={
              chatOfferQuery.data.acceptance.accepted
                ? chatOfferQuery.data.price
                : props.chat.listing?.price
            }
          />
        </>
      ) : (
        <P>Waiting seller acceptance</P>
      )
    ) : (
      <SellerOfferActions
        chatId={props.chat.id}
        activeOffer={chatOfferQuery.data}
      />
    )
  ) : isBuyer ? (
    <>
      <CreateOffer chat={props.chat} />
      <BuyListing chat={props.chat} price={props.chat.listing?.price} />
    </>
  ) : null;
}
