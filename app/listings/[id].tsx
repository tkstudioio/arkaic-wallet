import { Card } from "@/components/ui/card";
import { Large, P } from "@/components/ui/typography";
import { useListing } from "@/hooks/listings/use-listing";

import { Skeleton } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

import { AmountComponent } from "@/components/amount";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSellerChats } from "@/hooks/chats/use-seller-chats";
import { useStartChat } from "@/hooks/chats/use-start-chat";
import { useWebSocket } from "@/hooks/use-websocket";
import useAccountStore from "@/stores/account";
import { Link, useLocalSearchParams } from "expo-router";
import { first, map } from "lodash";
import { match } from "ts-pattern";

export default function Listing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pubkey } = useAccountStore();
  const listingQuery = useListing(id);
  const startChatMutation = useStartChat();

  return match(listingQuery)
    .with({ data: undefined }, () => null)
    .otherwise(({ data }) => (
      <VStack space='md'>
        <Card className='w-full'>
          <P>{data.seller?.username}</P>
          <Skeleton className='w-full h-max aspect-video' />
          <Large>{data.name}</Large>
          <VStack className='w-full items-end'>
            <AmountComponent size='4xl' amount={data.price} />
          </VStack>

          {pubkey !== data.sellerPubkey && (
            <Button onPress={() => startChatMutation.mutate(data)}>
              <ButtonText>Chat with seller</ButtonText>
              {startChatMutation.isPending && <Spinner />}
            </Button>
          )}
        </Card>

        {data.sellerPubkey === pubkey ? (
          <SellerListingChats listingId={data.id} />
        ) : null}
      </VStack>
    ));
}

function SellerListingChats(props: { listingId: number }) {
  useWebSocket();

  const sellerChatsQuery = useSellerChats(props.listingId);

  return match(sellerChatsQuery)
    .with({ data: undefined }, { data: [] }, () => <P>No chats</P>)
    .otherwise(({ data }) => {
      return map(data, (chat) => {
        const lastMessage = first(chat.messages);
        return (
          <Link
            key={chat.id}
            href={{ pathname: "/chats/[id]", params: { id: String(chat.id) } }}
          >
            <Card className='w-full'>
              <Large>{chat.buyer?.username}</Large>
              {lastMessage && <P>{lastMessage.message}</P>}
            </Card>
          </Link>
        );
      });
    });
}
