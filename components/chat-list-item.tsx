import { AmountComponent } from "@/components/amount";
import useAccountStore from "@/stores/account";
import { Chat } from "@/types/backend";
import { Link } from "expo-router";
import { ImageIcon } from "lucide-react-native";
import { View } from "react-native";
import { EscrowStatusBadge } from "./escrow";
import { Badge, BadgeText } from "./ui/badge";
import { Button } from "./ui/button";
import { HStack } from "./ui/hstack";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";

type ChatListItemProps = {
  chat: Chat;
};

export function ChatListItem({ chat }: ChatListItemProps) {
  const { pubkey } = useAccountStore();
  const lastMessage = chat.messages?.length
    ? chat.messages[chat.messages.length - 1]
    : null;

  const escrow = chat.escrow;
  const isBuyer = chat.buyerPubkey === pubkey;
  const counterpartName = isBuyer
    ? (chat.listing.seller?.username ?? "Seller")
    : (chat.buyer?.username ?? "Buyer");

  return (
    <Link
      href={{
        pathname: "/chats/[id]",
        params: { id: chat.id },
      }}
      className='w-full'
      asChild
    >
      <Button className='w-full' variant={"outline"} action={"neutral"}>
        <>
          <HStack space='md' className='items-center w-full'>
            <View className='h-14 w-14 rounded-md bg-arkaic-background items-center justify-center shrink-0'>
              <ImageIcon size={20} className='text-arkaic-muted' />
            </View>
            <VStack space='xs' className='flex-1'>
              <HStack className='justify-between items-center'>
                <P className='font-heading' numberOfLines={1}>{chat.listing.name}</P>
                {escrow ? (
                  <EscrowStatusBadge status={escrow.status} />
                ) : (
                  <Badge
                    size='sm'
                    action={chat.status === "open" ? "success" : "muted"}
                  >
                    <BadgeText>
                      {chat.status === "open" ? "Active" : "Concluded"}
                    </BadgeText>
                  </Badge>
                )}
              </HStack>
              {isBuyer ? (
                <AmountComponent amount={chat.listing.price} size='sm' />
              ) : (
                <Muted numberOfLines={1}>{counterpartName}</Muted>
              )}
              {lastMessage && (
                <Small className='text-typography-500' numberOfLines={1}>
                  {lastMessage.offer?.price != null
                    ? `Price proposal: ${lastMessage.offer.price} sats`
                    : (lastMessage.message ?? "")}
                </Small>
              )}
            </VStack>
          </HStack>
        </>
      </Button>
    </Link>
  );
}
