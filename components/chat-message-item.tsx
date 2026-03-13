import { ChatMessage } from "@/types/product";
import { format } from "date-fns";
import { View } from "react-native";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";

type ChatMessageItemProps = {
  message: ChatMessage;
  isOwnMessage: boolean;
  onAcceptOffer?: (messageId: number) => void;
  onRejectOffer?: (messageId: number) => void;
  isPendingAction?: boolean;
};

export function ChatMessageItem({
  message,
  isOwnMessage,
  onAcceptOffer,
  onRejectOffer,
  isPendingAction,
}: ChatMessageItemProps) {
  const isOffer = message.offerPrice != null;
  const canRespond = !isOwnMessage && message.offerStatus === "awaitingAccept";

  if (isOffer) {
    return (
      <View
        className={`max-w-[80%] ${isOwnMessage ? "self-end" : "self-start"}`}
      >
        <Card className='bg-arkaic-primary/10 border border-arkaic-primary/20'>
          <VStack space='xs'>
            <HStack className='justify-between items-center'>
              <Small className='font-heading'>Price proposal</Small>
              {message.offerStatus && (
                <Badge
                  size='sm'
                  action={
                    message.offerStatus === "accepted"
                      ? "success"
                      : message.offerStatus === "rejected"
                        ? "error"
                        : "warning"
                  }
                >
                  <BadgeText>
                    {message.offerStatus === "accepted"
                      ? "Accepted"
                      : message.offerStatus === "rejected"
                        ? "Rejected"
                        : "Pending"}
                  </BadgeText>
                </Badge>
              )}
            </HStack>
            <P className='font-heading'>{message.offerPrice} sats</P>
            {message.text && <Small>{message.text}</Small>}
            {canRespond && (
              <HStack space='sm'>
                <Button
                  size='sm'
                  action='positive'
                  className='flex-1'
                  onPress={() => onAcceptOffer?.(message.id)}
                  isDisabled={isPendingAction}
                >
                  <ButtonText>Accept</ButtonText>
                </Button>
                <Button
                  size='sm'
                  action='negative'
                  className='flex-1'
                  onPress={() => onRejectOffer?.(message.id)}
                  isDisabled={isPendingAction}
                >
                  <ButtonText>Reject</ButtonText>
                </Button>
              </HStack>
            )}
            <Muted className='text-xs'>
              {format(new Date(message.createdAt), "HH:mm")}
            </Muted>
          </VStack>
        </Card>
      </View>
    );
  }

  return (
    <View className={`max-w-[80%] ${isOwnMessage ? "self-end" : "self-start"}`}>
      <Card
        className={isOwnMessage ? "bg-arkaic-primary/10" : "bg-arkaic-fill"}
      >
        <VStack space='xs'>
          {message.text && <P>{message.text}</P>}
          <Muted className='text-xs'>
            {format(new Date(message.createdAt), "HH:mm")}
          </Muted>
        </VStack>
      </Card>
    </View>
  );
}
