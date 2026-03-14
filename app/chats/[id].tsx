import { AmountComponent } from "@/components/amount";
import { ChatActions } from "@/components/chat/chat-actions";
import { EscrowCard } from "@/components/escrow";
import { MessageComponent } from "@/components/message";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import { useChat } from "@/hooks/chats/use-chat";
import { useSendMessage } from "@/hooks/messages/use-send-message";
import { useActiveOffer } from "@/hooks/offers/use-active-offer";
import useAccountStore from "@/stores/account";
import { Chat, Offer } from "@/types/backend";
import { useLocalSearchParams, useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeft, EllipsisVertical, Send } from "lucide-react-native";
import { useState } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = Number(id);
  const chatQuery = useChat(chatId);
  const activeOfferQuery = useActiveOffer(chatId);
  const router = useRouter();
  const { pubkey } = useAccountStore();

  const counterpart =
    chatQuery.data?.buyerPubkey === pubkey
      ? chatQuery.data?.listing?.seller?.username
      : chatQuery.data?.buyer?.username;

  return (
    <VStack space='sm' className='w-full h-full'>
      <HStack className='items-center justify-between'>
        <Button
          action='neutral'
          variant={"link"}
          onPress={router.back}
          className='w-max'
        >
          <ButtonIcon as={ArrowLeft} />
        </Button>
        <P>{counterpart}</P>
        <Button action='neutral' variant={"link"} className='w-max'>
          <ButtonIcon as={EllipsisVertical} />
        </Button>
      </HStack>

      {match(chatQuery)
        .with({ data: undefined }, { data: null }, () => null)
        .otherwise(({ data }) => (
          <>
            <Card>
              <HStack space={"lg"}>
                <Skeleton className='w-max aspect-square h-max' />

                <VStack className='flex-1 items-start'>
                  <Large>{data?.listing?.name}</Large>
                  <AmountComponent size='xl' amount={data?.listing?.price} />
                </VStack>
              </HStack>
            </Card>

            <ScrollView className='h-24'>
              <VStack space={"md"} className='px-arkaic-sm'>
                {map(data?.messages, (message) => (
                  <MessageComponent key={message.signature} message={message} />
                ))}
              </VStack>
            </ScrollView>
            <SendMessage
              chat={data!}
              activeOffer={activeOfferQuery.data ?? null}
              escrowAddress={data?.escrow?.address}
            />
          </>
        ))}
    </VStack>
  );
}

function SendMessage(props: {
  chat: Chat;
  activeOffer: Offer | null;
  escrowAddress?: string | null;
}) {
  const sendMessageMutation = useSendMessage();
  const [message, setMessage] = useState<string>("");

  return (
    <Card>
      <VStack space={"lg"}>
        {message === "" && !props.escrowAddress && (
          <>
            <ChatActions
              chat={props.chat}
              activeOffer={props.activeOffer}
              hasEscrow={Boolean(props.escrowAddress)}
            />
            <Divider />
          </>
        )}

        {props.escrowAddress && (
          <>
            <EscrowCard
              escrowAddress={props.escrowAddress}
              chatId={props.chat.id}
            />
            <Divider />
          </>
        )}

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
      </VStack>
    </Card>
  );
}
