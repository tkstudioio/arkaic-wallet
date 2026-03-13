import { AmountComponent } from "@/components/amount";
import { Badge, BadgeText } from "@/components/ui/badge";
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
import { map } from "lodash";
import { ArrowLeft, Send } from "lucide-react-native";
import { useState } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatQuery = useChat(Number(id));
  const router = useRouter();

  return (
    <VStack space='lg' className='w-full h-full'>
      <Button
        action='neutral'
        variant={"outline"}
        onPress={router.back}
        className='w-max'
      >
        <ButtonIcon as={ArrowLeft} />
      </Button>

      {match(chatQuery)
        .with({ data: undefined }, { data: null }, () => null)
        .otherwise(({ data }) => (
          <>
            <ScrollView className='h-24'>
              <VStack space={"lg"}>
                <Card>
                  <Skeleton className='w-full h-max aspect-video' />

                  <Large>{data?.listing?.name}</Large>
                  <VStack className='w-full items-end'>
                    <AmountComponent size='4xl' amount={data?.listing?.price} />
                  </VStack>
                </Card>
                <VStack space={"md"} className='px-arkaic-sm'>
                  {map(data?.messages, (message) => (
                    <MessageComponent
                      key={message.signature}
                      message={message}
                    />
                  ))}
                </VStack>
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

  return (
    <Card
      variant={"outline"}
      className={
        props.message.senderPubkey === pubkey
          ? "ml-arkaic-xl flex justify-end items-end border-dashed"
          : "mr-arkaic-xl border-dashed"
      }
    >
      <HStack
        className={
          props.message.senderPubkey === pubkey
            ? "items-center justify-between w-full flex-row-reverse"
            : "items-center justify-between w-full"
        }
      >
        <Badge size={"lg"}>
          <BadgeText>
            {props.message.senderPubkey === pubkey
              ? "You"
              : props.message.sender?.username}
          </BadgeText>
        </Badge>
        <Small
          className={props.message.senderPubkey === pubkey ? "text-right" : ""}
        >
          {formatDistanceToNowStrict(props.message.sentAt)}
        </Small>
      </HStack>
      <P className={props.message.senderPubkey === pubkey ? "text-right" : ""}>
        {props.message.message}
      </P>
    </Card>
  );
}

function SendMessage(props: { chat: Chat }) {
  const sendMessageMutation = useSendMessage();
  const [message, setMessage] = useState<string>("");

  return (
    <Card>
      <VStack space={"lg"}>
        <HStack space={"md"}>
          <Button className='flex-1' variant={"outline"}>
            <ButtonText>New offer</ButtonText>
          </Button>
          <Button className='flex-1'>
            <ButtonText>Buy</ButtonText>
          </Button>
        </HStack>
        <Divider />
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
            variant={"outline"}
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
