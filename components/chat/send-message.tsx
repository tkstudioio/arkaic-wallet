import { Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";

import { useChatEscrow } from "@/hooks/chats/use-chat-escrow";
import { useSendMessage } from "@/hooks/messages/use-send-message";
import { Chat, Offer } from "@/types/backend";
import { Send } from "lucide-react-native";
import React, { useState } from "react";
import { match } from "ts-pattern";
import { EscrowActions } from "./escrow-actions";
import { OfferActions } from "./offer-actions";

export function SendMessage(props: {
  chat: Chat;
  activeOffer: Offer | null;
  escrowAddress?: string | null;
}) {
  const sendMessageMutation = useSendMessage();
  const [message, setMessage] = useState<string>("");
  const chatEscrowQuery = useChatEscrow(props.chat.id);

  return (
    <VStack space={"md"} className='h-max flex-shrink-0'>
      <HStack space={"md"} className='h-max flex-shrink-0'>
        {match(chatEscrowQuery)
          .with({ isSuccess: true }, ({ data }) => (
            <EscrowActions chat={props.chat} escrowAddress={data.address} />
          ))
          .otherwise(() => (
            <OfferActions chat={props.chat} />
          ))}
      </HStack>
      <Card>
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
      </Card>
    </VStack>
  );
}
