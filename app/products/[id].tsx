import { Card } from "@/components/ui/card";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { useProduct } from "@/hooks/products/use-product";
import { useProductChats } from "@/hooks/chats/use-product-chats";
import { useOpenChat } from "@/hooks/chats/use-open-chat";
import { ChatListItem } from "@/components/chat-list-item";
import { ProductEvent } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import useAccountStore from "@/stores/account";
import { format } from "date-fns";

import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { useLocalSearchParams, useRouter } from "expo-router";
import { toNumber } from "lodash";
import { View } from "react-native";
import { useEffect, useState } from "react";

const EVENT_LABELS: Record<string, string> = {
  created: "Product created",
  funds_locked: "Funds locked by buyer",
  seller_signed_psbt: "Seller signed collaborate PSBT",
  buyer_signed_psbt: "Buyer signed collaborate PSBT",
  buyer_signed_checkpoints: "Buyer signed checkpoints",
  seller_signed_checkpoints: "Seller signed checkpoints — funds released",
  refund_submitted: "Refund submitted",
  refund_finalized: "Refund finalized",
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { wallet } = useAccountStore();

  const castedId = toNumber(id);
  if (isNaN(castedId)) throw new Error("Wrong id");

  const { data: product, isLoading } = useProduct(castedId);
  const { data: chats } = useProductChats(castedId);
  const openChat = useOpenChat();

  const [userPubkey, setUserPubkey] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) return;
    getPubkeyHex(wallet).then(setUserPubkey);
  }, [wallet]);

  if (isLoading) return <Spinner />;
  if (!product) return <P>No product</P>;

  const isSeller = userPubkey === product.seller?.pubkey;

  const handleOpenChat = () => {
    openChat.mutate(
      { productId: castedId },
      {
        onSuccess: (chat) => {
          router.push({
            pathname: "/chats/[chatId]",
            params: { chatId: chat.id },
          });
        },
      },
    );
  };

  // Check if buyer already has a chat
  const buyerChat = !isSeller && chats?.find(
    (c) => c.buyer?.pubkey === userPubkey,
  );

  return (
    <VStack space='md'>
      {/* Product info */}
      <Card>
        <Large>{product.name}</Large>
        <P>Price: {product.price} sats</P>
        <P>Seller: {product.seller?.pubkey?.slice(0, 7) ?? "Unknown"}</P>
      </Card>

      {/* Chat section */}
      {isSeller && chats && chats.length > 0 && (
        <VStack space='sm'>
          <P className='font-heading'>Buyer chats</P>
          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </VStack>
      )}

      {!isSeller && (
        <VStack space='sm'>
          {buyerChat ? (
            <Button
              onPress={() =>
                router.push({
                  pathname: "/chats/[chatId]",
                  params: { chatId: buyerChat.id },
                })
              }
            >
              <ButtonText>Open chat</ButtonText>
            </Button>
          ) : (
            <Button
              onPress={handleOpenChat}
              isDisabled={openChat.isPending}
            >
              <ButtonText>
                {openChat.isPending ? "Opening..." : "Chat with seller"}
              </ButtonText>
            </Button>
          )}
        </VStack>
      )}

      {/* Activity log */}
      {product.events && <ActivityLog events={product.events} />}
    </VStack>
  );
}

function ActivityLog({ events }: { events: ProductEvent[] }) {
  if (events.length === 0) return null;

  return (
    <VStack space='sm' className='mt-4'>
      <P className='font-heading'>Activity</P>
      {events.map((event, index) => (
        <View
          key={event.id}
          className='flex-row items-start gap-2 border-l-2 border-outline-200 pl-3'
          style={
            index === events.length - 1
              ? { borderColor: "transparent" }
              : undefined
          }
        >
          <View className='flex-1'>
            <Small>{EVENT_LABELS[event.action] ?? event.action}</Small>
            <Muted>{format(new Date(event.createdAt), "MMM d, HH:mm")}</Muted>
          </View>
        </View>
      ))}
    </VStack>
  );
}
