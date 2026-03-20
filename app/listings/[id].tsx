import { AmountComponent } from "@/components/amount";
import { ChatListItem } from "@/components/chat-list-item";
import { AttributeDisplay } from "@/components/listing/attribute-display";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useSellerChats } from "@/hooks/chats/use-seller-chats";
import { useStartChat } from "@/hooks/chats/use-start-chat";
import { useIsFavorite } from "@/hooks/favorites/use-is-favorite";
import { useToggleFavorite } from "@/hooks/favorites/use-toggle-favorite";
import { useListing } from "@/hooks/listings/use-listing";
import { useWebSocket } from "@/hooks/use-websocket";
import useAccountStore from "@/stores/account";
import { ListingAttributeValue } from "@/types/backend";
import { shortenAddress } from "@/utils/shorten-address";
import { useLocalSearchParams, useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeft, Heart, ImageIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { match } from "ts-pattern";

export default function Listing() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pubkey } = useAccountStore();
  const listingQuery = useListing(id);
  const startChatMutation = useStartChat();
  const router = useRouter();
  const { isFavorite } = useIsFavorite(Number(id));
  const toggleFavorite = useToggleFavorite();

  return match(listingQuery)
    .with({ data: undefined }, () => null)
    .otherwise(({ data }) => (
      <VStack className='flex-1 h-full'>
        <VStack space={"md"}>
          <HStack className='items-center justify-between' space='md'>
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
            {data.sellerPubkey !== pubkey ? (
              <Button
                action='neutral'
                variant='link'
                onPress={() => toggleFavorite.mutate({ listingId: Number(id), isFavorite })}
                className='w-max'
              >
                <ButtonIcon
                  as={Heart}
                  className={isFavorite ? "text-arkaic-primary" : "text-arkaic-muted"}
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </Button>
            ) : null}
          </HStack>
          <Divider />
        </VStack>

        <ScrollView className='flex-1 py-arkaic-md'>
          <VStack space='md'>
            <Card className='w-full'>
              <VStack space='sm'>
                <Large className='font-semibold'>Details</Large>
                <Divider />

                <View className='w-full aspect-video bg-arkaic-background rounded-lg items-center justify-center'>
                  <ImageIcon size={48} className='text-arkaic-muted' />
                  <Muted>No image</Muted>
                </View>

                <Large>{data.name}</Large>
                {data.description ? <P>{data.description}</P> : null}

                <AmountComponent size='4xl' amount={data.price} />

                <Divider />

                {data.category ? (
                  <HStack className='justify-between items-center'>
                    <Small className='text-arkaic-muted'>Category</Small>
                    <P>
                      {data.category.parent
                        ? `${data.category.parent.name} > ${data.category.name}`
                        : data.category.name}
                    </P>
                  </HStack>
                ) : null}

                <HStack className='justify-between items-center'>
                  <Small className='text-arkaic-muted'>Listed on</Small>
                  <P>{new Date(data.createdAt).toLocaleDateString()}</P>
                </HStack>
              </VStack>
            </Card>

            <ListingAttributes attributes={data.attributes} />

            {data.sellerPubkey !== pubkey ? (
              <Card className='w-full'>
                <VStack space='sm'>
                  <Large className='font-semibold'>Seller info</Large>
                  <Divider />

                  <HStack className='justify-between items-center'>
                    <Small className='text-arkaic-muted'>Username</Small>
                    <P>{data.seller?.username ?? "Unknown"}</P>
                  </HStack>

                  <HStack className='justify-between items-center'>
                    <Small className='text-arkaic-muted'>Public key</Small>
                    <Muted>{shortenAddress(data.sellerPubkey)}</Muted>
                  </HStack>
                </VStack>
              </Card>
            ) : null}

            {data.sellerPubkey === pubkey ? (
              <SellerListingChats listingId={data.id} />
            ) : null}
          </VStack>
        </ScrollView>

        <VStack className='py-4'>
          {pubkey !== data.sellerPubkey ? (
            (() => {
              const myChat = data.chats?.find((c) => c.buyerPubkey === pubkey);
              const isCompleted = myChat?.escrow?.status === "completed";

              return isCompleted ? (
                <Button
                  action='neutral'
                  variant='outline'
                  onPress={() => router.push(`/chats/${myChat!.id}`)}
                >
                  <ButtonText>View chat history</ButtonText>
                </Button>
              ) : (
                <Button
                  onPress={() => startChatMutation.mutate(data)}
                  isDisabled={startChatMutation.isPending}
                >
                  <ButtonText>Chat with seller</ButtonText>
                  {startChatMutation.isPending && <Spinner />}
                </Button>
              );
            })()
          ) : (
            <Button action='neutral' variant='outline' isDisabled>
              <ButtonText>Edit listing</ButtonText>
            </Button>
          )}
        </VStack>
      </VStack>
    ));
}

type ListingAttributesProps = {
  attributes: ListingAttributeValue[] | undefined;
};

function ListingAttributes({ attributes }: ListingAttributesProps) {
  if (!attributes || attributes.length === 0) return null;

  return (
    <Card className='w-full'>
      <VStack space='sm'>
        <Large className='font-semibold'>Attributes</Large>
        <Divider />
        {attributes.map((attrVal) => (
          <AttributeDisplay
            key={attrVal.attributeId}
            attributeValue={attrVal}
          />
        ))}
      </VStack>
    </Card>
  );
}

function SellerListingChats(props: { listingId: number }) {
  useWebSocket();
  const sellerChatsQuery = useSellerChats(props.listingId);

  return (
    <Card className='w-full'>
      <VStack space='sm'>
        <Large className='font-semibold'>Active Chats</Large>
        <Divider />
        {match(sellerChatsQuery)
          .with({ data: undefined }, { data: [] }, () => <P>No chats</P>)
          .otherwise(({ data }) =>
            map(data, (chat) => <ChatListItem key={chat.id} chat={chat} />),
          )}
      </VStack>
    </Card>
  );
}
