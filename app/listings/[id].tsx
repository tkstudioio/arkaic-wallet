import { AmountComponent } from "@/components/amount";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useSellerChats } from "@/hooks/chats/use-seller-chats";
import { useStartChat } from "@/hooks/chats/use-start-chat";
import { useListing } from "@/hooks/listings/use-listing";
import { useWebSocket } from "@/hooks/use-websocket";
import useAccountStore from "@/stores/account";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { first, map } from "lodash";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function Listing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pubkey } = useAccountStore();
  const listingQuery = useListing(id);
  const startChatMutation = useStartChat();
  const router = useRouter();

  return match(listingQuery)
    .with({ data: undefined }, () => null)
    .otherwise(({ data }) => (
      <VStack className='flex-1 h-full'>
        <VStack space={"md"}>
          <HStack className='items-center' space='md'>
            <Button
              action='neutral'
              variant='link'
              onPress={router.back}
              className='w-max'
            >
              <ButtonIcon as={ArrowLeft} />
            </Button>
            <Small className='font-semibold'>Go back</Small>
          </HStack>
          <Divider />
        </VStack>

        <ScrollView className='flex-1 py-arkaic-md'>
          <VStack space='md'>
            <Card className='w-full'>
              <Skeleton className='w-full h-max aspect-video' />
              <VStack space='xs'>
                {data.category ? (
                  <HStack space='xs' className='items-center'>
                    {data.category.parent ? (
                      <>
                        <Badge>
                          <BadgeText>{data.category.parent.name}</BadgeText>
                        </Badge>
                        <Small>/</Small>
                      </>
                    ) : null}
                    <Badge>
                      <BadgeText>{data.category.name}</BadgeText>
                    </Badge>
                  </HStack>
                ) : null}
                <Large>{data.name}</Large>
                {data.description ? <P>{data.description}</P> : null}
              </VStack>

              <AmountComponent size='4xl' amount={data.price} />
            </Card>

            {data.sellerPubkey === pubkey ? (
              <SellerListingChats listingId={data.id} />
            ) : null}
          </VStack>
        </ScrollView>

        <VStack className='py-4'>
          {pubkey !== data.sellerPubkey ? (
            <Button
              onPress={() => startChatMutation.mutate(data)}
              isDisabled={startChatMutation.isPending}
            >
              <ButtonText>Chat with seller</ButtonText>
              {startChatMutation.isPending && <Spinner />}
            </Button>
          ) : (
            <Button action='neutral' variant='outline' isDisabled>
              <ButtonText>Edit listing</ButtonText>
            </Button>
          )}
        </VStack>
      </VStack>
    ));
}

function SellerListingChats(props: { listingId: number }) {
  useWebSocket();
  const sellerChatsQuery = useSellerChats(props.listingId);

  return match(sellerChatsQuery)
    .with({ data: undefined }, { data: [] }, () => <P>No chats</P>)
    .otherwise(({ data }) => (
      <VStack space='sm'>
        {map(data, (chat) => {
          const lastMessage = first(chat.messages);
          return (
            <Link
              key={chat.id}
              href={{
                pathname: "/chats/[id]",
                params: { id: String(chat.id) },
              }}
            >
              <Card className='w-full'>
                <Large>{chat.buyer?.username}</Large>
                {lastMessage && <P>{lastMessage.message}</P>}
              </Card>
            </Link>
          );
        })}
      </VStack>
    ));
}
