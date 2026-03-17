import { AmountComponent } from "@/components/amount";
import { SendMessage } from "@/components/chat/send-message";
import { MessageComponent } from "@/components/message";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { Large } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";

import { useChat } from "@/hooks/chats/use-chat";
import { useActiveOffer } from "@/hooks/offers/use-active-offer";
import useAccountStore from "@/stores/account";
import { useLocalSearchParams, useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeft } from "lucide-react-native";
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
    <VStack className='h-full w-full'>
      <VStack className='w-full h-max' space={"lg"}>
        <HStack className='items-center justify-between' space={"md"}>
          <Button
            action='neutral'
            variant={"link"}
            onPress={router.back}
            className='w-max'
          >
            <ButtonIcon as={ArrowLeft} />
          </Button>
          <Large>{counterpart}</Large>
        </HStack>

        {match(chatQuery)
          .with({ isLoading: true }, () => <Skeleton className='h-28 w-full' />)
          .with({ isSuccess: true }, ({ data }) => (
            <Card className='h-28'>
              <HStack space={"md"} className='h-full items-center'>
                <Skeleton className='h-full aspect-square w-max' />
                <VStack className='flex-1 items-start' space={"xs"}>
                  <Large>{data?.listing?.name}</Large>
                  <AmountComponent size='3xl' amount={data?.listing?.price} />
                </VStack>
              </HStack>
            </Card>
          ))
          .otherwise(() => null)}
        <Divider />
      </VStack>
      {match(chatQuery)
        .with({ isLoading: true }, () => (
          <Skeleton className='w-full flex-1 my-arkaic-md' />
        ))
        .with({ data: undefined }, { data: null }, () => null)
        .otherwise(({ data }) => (
          <>
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: false })
              }
            >
              <VStack space={"md"} className=' py-arkaic-md'>
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
