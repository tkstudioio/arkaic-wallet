import { ChatMessage } from "@/types/product";
import { Card } from "./ui/card";
import { Muted, P, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";
import { format } from "date-fns";
import { View } from "react-native";

type ChatMessageItemProps = {
  message: ChatMessage;
  isOwnMessage: boolean;
};

export function ChatMessageItem({
  message,
  isOwnMessage,
}: ChatMessageItemProps) {
  const isOffer = message.offerPrice != null;

  if (isOffer) {
    return (
      <View
        className={`max-w-[80%] ${isOwnMessage ? "self-end" : "self-start"}`}
      >
        <Card className='bg-arkaic-primary/10 border border-arkaic-primary/20'>
          <VStack space='xs'>
            <Small className='font-heading'>Price proposal</Small>
            <P className='font-heading'>{message.offerPrice} sats</P>
            {message.text && <Small>{message.text}</Small>}
            <Muted className='text-xs'>
              {format(new Date(message.createdAt), "HH:mm")}
            </Muted>
          </VStack>
        </Card>
      </View>
    );
  }

  return (
    <View
      className={`max-w-[80%] ${isOwnMessage ? "self-end" : "self-start"}`}
    >
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
