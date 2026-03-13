import { AmountComponent } from "@/components/amount";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import { useChat } from "@/hooks/chats/use-chat";
import { useSendMessage } from "@/hooks/messages/use-send-message";
import useAccountStore from "@/stores/account";
import { Chat, Message } from "@/types/backend";
import { formatDistanceToNowStrict } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { first, map } from "lodash";
import {
  ArrowLeft,
  EllipsisVertical,
  HandCoins,
  Handshake,
  Send,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatQuery = useChat(Number(id));
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
            <SendMessage chat={data!} />
          </>
        ))}
    </VStack>
  );
}

function MessageComponent(props: { message: Message }) {
  const { pubkey } = useAccountStore();

  const isSender = props.message.senderPubkey === pubkey;
  return (
    <VStack space={"md"}>
      <Card
        variant={"outline"}
        className={
          isSender
            ? "ml-arkaic-xl flex justify-end items-end bg-arkaic-fill"
            : "mr-arkaic-xl bg-arkaic-fill border-arkaic-primary"
        }
      >
        <P className={isSender ? "text-right" : ""}>{props.message.message}</P>
      </Card>
      <HStack
        space={"sm"}
        className={isSender ? "flex-row-reverse items-center" : "items-center"}
      >
        <Avatar size={"xs"}>
          <AvatarFallbackText>
            {first(props.message.sender?.username)}
          </AvatarFallbackText>
        </Avatar>
        <Small className={isSender ? "text-right" : ""}>
          {formatDistanceToNowStrict(props.message.sentAt)}
        </Small>
      </HStack>
    </VStack>
  );
}

function SendMessage(props: { chat: Chat }) {
  const sendMessageMutation = useSendMessage();
  const [message, setMessage] = useState<string>("");

  return (
    <Card>
      <VStack space={"lg"}>
        {message === "" && (
          <>
            <HStack space={"md"}>
              <Button className='flex-1' variant={"outline"}>
                <ButtonText>New offer</ButtonText>
                <ButtonIcon as={HandCoins} />
              </Button>
              <Button className='flex-1'>
                <ButtonText>Buy</ButtonText>
                <ButtonIcon as={Handshake} />
              </Button>
            </HStack>
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
                  offerPrice: 0,
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
