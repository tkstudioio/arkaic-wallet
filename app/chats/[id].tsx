import { AmountComponent } from "@/components/amount";
import { SendMessage } from "@/components/chat/send-message";
import { MessageComponent } from "@/components/message";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import { useChat } from "@/hooks/chats/use-chat";
import { useActiveOffer } from "@/hooks/offers/use-active-offer";
import useAccountStore from "@/stores/account";
import { useLocalSearchParams, useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeft, EllipsisVertical } from "lucide-react-native";
import { useRef } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = Number(id);
  const chatQuery = useChat(chatId);
  const activeOfferQuery = useActiveOffer(chatId);
  const router = useRouter();
  const { pubkey } = useAccountStore();
  const scrollViewRef = useRef<ScrollView>(null);

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

            <ScrollView
              ref={scrollViewRef}
              className='h-24'
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: false })
              }
            >
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
