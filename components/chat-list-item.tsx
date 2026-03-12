import { ProductChat } from "@/types/product";
import { Card } from "./ui/card";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Badge, BadgeText } from "./ui/badge";
import { Link } from "expo-router";

type ChatListItemProps = {
  chat: ProductChat;
};

export function ChatListItem({ chat }: ChatListItemProps) {
  const lastMessage = chat.messages?.length
    ? chat.messages[chat.messages.length - 1]
    : null;

  return (
    <Link
      href={{
        pathname: "/chats/[id]",
        params: { id: chat.id },
      }}
      className='w-full'
    >
      <Card className='w-full'>
        <VStack space='sm'>
          <HStack className='justify-between items-center'>
            <P className='font-heading'>
              {chat.buyer?.accountName ?? chat.buyer?.pubkey?.slice(0, 7) ?? "Buyer"}
            </P>
            <Badge
              size='sm'
              action={chat.status === "active" ? "success" : "muted"}
            >
              <BadgeText>
                {chat.status === "active" ? "Active" : "Concluded"}
              </BadgeText>
            </Badge>
          </HStack>
          {lastMessage && (
            <Small className='text-typography-500' numberOfLines={1}>
              {lastMessage.offerPrice != null
                ? `Price proposal: ${lastMessage.offerPrice} sats${lastMessage.offerStatus ? ` (${lastMessage.offerStatus})` : ""}`
                : lastMessage.text ?? ""}
            </Small>
          )}
          {chat.escrow && (
            <Muted>Escrow: {chat.escrow.status}</Muted>
          )}
        </VStack>
      </Card>
    </Link>
  );
}
