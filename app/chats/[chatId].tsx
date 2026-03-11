import { useChat } from "@/hooks/chats/use-chat";
import { useSendMessage } from "@/hooks/chats/use-send-message";
import { useAcceptOffer } from "@/hooks/chats/use-accept-offer";
import { useFundEscrow } from "@/hooks/escrows/use-fund-escrow";
import { useSellerSignCollaborate } from "@/hooks/escrows/use-seller-sign-collaborate";
import { useBuyerConfirmCollaborate } from "@/hooks/escrows/use-buyer-confirm-collaborate";
import { useSellerSignCheckpoints } from "@/hooks/escrows/use-seller-sign-checkpoints";
import { useRefund } from "@/hooks/escrows/use-refund";
import { ChatMessageItem } from "@/components/chat-message-item";
import { Card } from "@/components/ui/card";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Badge, BadgeText } from "@/components/ui/badge";
import useAccountStore from "@/stores/account";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { EscrowStatus } from "@/types/product";

import { useLocalSearchParams } from "expo-router";
import { toNumber } from "lodash";
import { FlatList, View } from "react-native";
import { isAfter, subMinutes } from "date-fns";
import { useCallback, useEffect, useState } from "react";

const ESCROW_STATUS_LABEL: Record<EscrowStatus, string> = {
  awaitingFunds: "Awaiting funds",
  fundLocked: "Funds locked",
  sellerReady: "Seller ready",
  buyerSubmitted: "Buyer submitted",
  buyerCheckpointsSigned: "Checkpoints signed",
  completed: "Completed",
  refunded: "Refunded",
};

export default function ChatDetail() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const castedId = toNumber(chatId);
  if (isNaN(castedId)) throw new Error("Wrong chatId");

  const { wallet } = useAccountStore();
  const { data: chat, isLoading } = useChat(castedId);
  const sendMessage = useSendMessage();
  const acceptOffer = useAcceptOffer();
  const fundEscrow = useFundEscrow();
  const sellerSignCollab = useSellerSignCollaborate();
  const buyerConfirmCollab = useBuyerConfirmCollaborate();
  const sellerSignCheckpoints = useSellerSignCheckpoints();
  const refund = useRefund();

  const [text, setText] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [userPubkey, setUserPubkey] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) return;
    getPubkeyHex(wallet).then(setUserPubkey);
  }, [wallet]);

  const handleSend = useCallback(() => {
    if (!text.trim() && !offerPrice) return;

    const params: { chatId: number; text?: string; offerPrice?: number } = {
      chatId: castedId,
    };
    if (text.trim()) params.text = text.trim();
    if (offerPrice) params.offerPrice = Number(offerPrice);

    sendMessage.mutate(params, {
      onSuccess: () => {
        setText("");
        setOfferPrice("");
        setShowOfferInput(false);
      },
    });
  }, [text, offerPrice, castedId, sendMessage]);

  const handleAccept = useCallback(() => {
    const timelockExpiry = Math.floor(
      subMinutes(new Date(), 5).getTime() / 1000,
    );
    acceptOffer.mutate({ chatId: castedId, timelockExpiry });
  }, [castedId, acceptOffer]);

  if (isLoading) return <Spinner />;
  if (!chat) return <P>Chat not found</P>;

  const isSeller = userPubkey === chat.product?.seller?.pubkey;
  const isBuyer = userPubkey === chat.buyer?.pubkey;
  const hasEscrow = !!chat.escrow;
  const escrow = chat.escrow;

  const timelockExpired = escrow
    ? isAfter(new Date(), new Date(escrow.timelockExpiry * 1000))
    : false;

  const messages = [...(chat.messages ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const isAnyEscrowActionPending =
    fundEscrow.isPending ||
    sellerSignCollab.isPending ||
    buyerConfirmCollab.isPending ||
    sellerSignCheckpoints.isPending ||
    refund.isPending;

  return (
    <VStack className='h-full' space='md'>
      {/* Header */}
      <Card>
        <VStack space='xs'>
          <Large>{chat.product?.name ?? "Product"}</Large>
          <P>{chat.product?.price ?? 0} sats</P>
          <Muted>
            {isSeller
              ? `Buyer: ${chat.buyer?.accountName ?? chat.buyer?.pubkey?.slice(0, 7) ?? "Unknown"}`
              : `Seller: ${chat.product?.seller?.pubkey?.slice(0, 7) ?? "Unknown"}`}
          </Muted>
          <HStack space='sm'>
            <Badge
              size='sm'
              action={chat.status === "active" ? "success" : "muted"}
            >
              <BadgeText>
                {chat.status === "active" ? "Active" : "Concluded"}
              </BadgeText>
            </Badge>
          </HStack>
        </VStack>
      </Card>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        inverted
        className='flex-1'
        contentContainerClassName='gap-2 px-arkaic-sm'
        renderItem={({ item }) => (
          <ChatMessageItem
            message={item}
            isOwnMessage={item.sender === userPubkey}
          />
        )}
      />

      {/* Escrow section */}
      {hasEscrow && escrow && (
        <Card className='mx-arkaic-sm'>
          <VStack space='sm'>
            <HStack className='justify-between items-center'>
              <Small className='font-heading'>Escrow</Small>
              <Badge size='sm'>
                <BadgeText>
                  {ESCROW_STATUS_LABEL[escrow.status] ?? escrow.status}
                </BadgeText>
              </Badge>
            </HStack>
            <Small>{escrow.value} sats</Small>

            {/* Escrow action buttons */}
            {isBuyer && escrow.status === "awaitingFunds" && (
              <Button
                onPress={() =>
                  fundEscrow.mutate({
                    escrow,
                    sellerPubkey: chat.product?.seller?.pubkey ?? "",
                  })
                }
                isDisabled={isAnyEscrowActionPending}
              >
                <ButtonText>
                  {fundEscrow.isPending ? "Funding..." : "Fund escrow"}
                </ButtonText>
              </Button>
            )}

            {isSeller && escrow.status === "fundLocked" && (
              <Button
                onPress={() =>
                  sellerSignCollab.mutate({
                    escrowId: escrow.id,
                    chatId: castedId,
                  })
                }
                isDisabled={isAnyEscrowActionPending}
              >
                <ButtonText>
                  {sellerSignCollab.isPending
                    ? "Signing..."
                    : "Sign collaborate"}
                </ButtonText>
              </Button>
            )}

            {isBuyer && escrow.status === "sellerReady" && (
              <Button
                onPress={() =>
                  buyerConfirmCollab.mutate({
                    escrowId: escrow.id,
                    chatId: castedId,
                  })
                }
                isDisabled={isAnyEscrowActionPending}
              >
                <ButtonText>
                  {buyerConfirmCollab.isPending
                    ? "Confirming..."
                    : "Confirm collaborate"}
                </ButtonText>
              </Button>
            )}

            {isSeller &&
              (escrow.status === "buyerSubmitted" ||
                escrow.status === "buyerCheckpointsSigned") && (
                <Button
                  onPress={() =>
                    sellerSignCheckpoints.mutate({
                      escrowId: escrow.id,
                      chatId: castedId,
                    })
                  }
                  isDisabled={isAnyEscrowActionPending}
                >
                  <ButtonText>
                    {sellerSignCheckpoints.isPending
                      ? "Signing..."
                      : "Sign checkpoints"}
                  </ButtonText>
                </Button>
              )}

            {isBuyer &&
              timelockExpired &&
              escrow.status !== "completed" &&
              escrow.status !== "refunded" && (
                <Button
                  action='negative'
                  onPress={() =>
                    refund.mutate({ escrowId: escrow.id, chatId: castedId })
                  }
                  isDisabled={isAnyEscrowActionPending}
                >
                  <ButtonText>
                    {refund.isPending ? "Refunding..." : "Claim refund"}
                  </ButtonText>
                </Button>
              )}

            {(escrow.status === "completed" ||
              escrow.status === "refunded") && (
              <Small className='text-center'>
                {escrow.status === "completed"
                  ? "Transaction completed"
                  : "Funds refunded"}
              </Small>
            )}
          </VStack>
        </Card>
      )}

      {/* Accept button (buyer only, no escrow yet) */}
      {isBuyer && !hasEscrow && chat.status === "active" && (
        <View className='px-arkaic-sm'>
          <Button
            onPress={handleAccept}
            isDisabled={acceptOffer.isPending}
          >
            <ButtonText>
              {acceptOffer.isPending ? "Accepting..." : "Accept offer"}
            </ButtonText>
          </Button>
        </View>
      )}

      {/* Input bar */}
      {chat.status === "active" && (
        <Card className='gap-2'>
          {showOfferInput && (
            <Input size='sm'>
              <InputField
                placeholder='Price in sats'
                keyboardType='numeric'
                value={offerPrice}
                onChangeText={setOfferPrice}
              />
            </Input>
          )}
          <HStack space='sm' className='items-center'>
            <View className='flex-1'>
              <Input>
                <InputField
                  placeholder='Message...'
                  value={text}
                  onChangeText={setText}
                  onSubmitEditing={handleSend}
                />
              </Input>
            </View>
            <Button
              size='sm'
              variant='outline'
              onPress={() => setShowOfferInput(!showOfferInput)}
            >
              <ButtonText>$</ButtonText>
            </Button>
            <Button
              size='sm'
              onPress={handleSend}
              isDisabled={
                sendMessage.isPending || (!text.trim() && !offerPrice)
              }
            >
              <ButtonText>Send</ButtonText>
            </Button>
          </HStack>
        </Card>
      )}
    </VStack>
  );
}
