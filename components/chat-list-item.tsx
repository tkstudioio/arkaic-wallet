import { Chat } from "@/types/backend";
import { Card } from "./ui/card";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Badge, BadgeText } from "./ui/badge";
import { Link } from "expo-router";
import { EscrowStatusBadge } from "./escrow";

type ChatListItemProps = {
  chat: Chat;
};

export function ChatListItem({ chat }: ChatListItemProps) {
  const lastMessage = chat.messages?.length
    ? chat.messages[chat.messages.length - 1]
    : null;

  const escrow = chat.escrow;

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
              {chat.buyer?.username ?? "Buyer"}
            </P>
            <Badge
              size='sm'
              action={chat.status === "open" ? "success" : "muted"}
            >
              <BadgeText>
                {chat.status === "open" ? "Active" : "Concluded"}
              </BadgeText>
            </Badge>
          </HStack>
          {lastMessage && (
            <Small className='text-typography-500' numberOfLines={1}>
              {lastMessage.offer?.price != null
                ? `Price proposal: ${lastMessage.offer.price} sats`
                : lastMessage.message ?? ""}
            </Small>
          )}
          {escrow && <EscrowStatusBadge status={escrow.status} />}
        </VStack>
      </Card>
    </Link>
  );
}
