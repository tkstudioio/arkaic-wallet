import { Chat } from "@/types/backend";
import { Link } from "expo-router";
import { AmountComponent } from "./amount";
import { EscrowStatusBadge } from "./escrow";
import { Badge, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function BuyingChatItem({ chat }: { chat: Chat }) {
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
            <P className='font-heading flex-1' numberOfLines={1}>
              {chat.listing?.name ?? "Product"}
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

          <AmountComponent size='lg' amount={chat.listing?.price ?? 0} />

          <Muted>
            Seller:{" "}
            {chat.listing?.seller?.username ??
              chat.listing?.sellerPubkey?.slice(0, 7) ??
              "Unknown"}
          </Muted>

          {lastMessage && (
            <Small className='text-typography-500' numberOfLines={1}>
              {lastMessage.offer?.price != null
                ? `Price proposal: ${lastMessage.offer.price} sats`
                : (lastMessage.message ?? "")}
            </Small>
          )}

          {chat.escrow && <EscrowStatusBadge status={chat.escrow.status} />}
        </VStack>
      </Card>
    </Link>
  );
}
