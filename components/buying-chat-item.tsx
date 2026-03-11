import { EscrowStatus, ProductChat } from "@/types/product";
import { Card } from "./ui/card";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";
import { HStack } from "./ui/hstack";
import { Badge, BadgeText } from "./ui/badge";
import { Link } from "expo-router";
import { AmountComponent } from "./amount";

const escrowBadgeAction: Record<EscrowStatus, string> = {
  awaitingFunds: "warning",
  fundLocked: "info",
  sellerReady: "info",
  buyerSubmitted: "info",
  buyerCheckpointsSigned: "info",
  completed: "success",
  refunded: "error",
};

const escrowStatusLabel: Record<EscrowStatus, string> = {
  awaitingFunds: "Awaiting funds",
  fundLocked: "Funds locked",
  sellerReady: "Seller ready",
  buyerSubmitted: "Buyer submitted",
  buyerCheckpointsSigned: "Checkpoints signed",
  completed: "Completed",
  refunded: "Refunded",
};

export function BuyingChatItem({ chat }: { chat: ProductChat }) {
  const lastMessage = chat.messages?.length
    ? chat.messages[chat.messages.length - 1]
    : null;

  return (
    <Link
      href={{
        pathname: "/chats/[chatId]",
        params: { chatId: chat.id },
      }}
      className='w-full'
    >
      <Card className='w-full'>
        <VStack space='sm'>
          <HStack className='justify-between items-center'>
            <P className='font-heading flex-1' numberOfLines={1}>
              {chat.product?.name ?? "Product"}
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

          <AmountComponent size='lg' amount={chat.product?.price ?? 0} />

          <Muted>
            Seller: {chat.product?.seller?.pubkey?.slice(0, 7) ?? "Unknown"}
          </Muted>

          {lastMessage && (
            <Small className='text-typography-500' numberOfLines={1}>
              {lastMessage.offerPrice != null
                ? `Price proposal: ${lastMessage.offerPrice} sats`
                : lastMessage.text ?? ""}
            </Small>
          )}

          {chat.escrow && (
            <Badge
              size='sm'
              action={
                (escrowBadgeAction[chat.escrow.status] as
                  | "warning"
                  | "info"
                  | "success"
                  | "error") ?? "muted"
              }
            >
              <BadgeText>
                {escrowStatusLabel[chat.escrow.status] ?? chat.escrow.status}
              </BadgeText>
            </Badge>
          )}
        </VStack>
      </Card>
    </Link>
  );
}
