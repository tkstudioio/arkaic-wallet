import { Card } from "@/components/ui/card";
import { Large, Small } from "@/components/ui/typography";
import { useIsFavorite } from "@/hooks/favorites/use-is-favorite";
import { useToggleFavorite } from "@/hooks/favorites/use-toggle-favorite";
import { UPLOADS_BASE_URL } from "@/lib/api";
import { Listing } from "@/types/backend";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Heart, ImageIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { match } from "ts-pattern";
import { AmountComponent } from "./amount";
import { CategoryBadge } from "./category-badge";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function ListingItem({ listing }: { listing: Listing }) {
  const { isFavorite } = useIsFavorite(listing.id);
  const toggleFavorite = useToggleFavorite();
  const router = useRouter();

  return (
    <Pressable
      className='w-full'
      onPress={() =>
        router.push({ pathname: "/listings/[id]", params: { id: listing.id } })
      }
    >
      <Card className='justify-start relative'>
        <Pressable
          className='absolute top-2 right-2 z-10 p-1'
          onPress={() =>
            toggleFavorite.mutate({ listingId: listing.id, isFavorite })
          }
          hitSlop={8}
        >
          <Heart
            size={18}
            className={isFavorite ? "text-arkaic-primary" : "text-arkaic-muted"}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </Pressable>
        <HStack space={"md"}>
          {match(listing.photos?.[0])
            .with(undefined, () => (
              <View
                style={{ width: 80, height: 80 }}
                className="rounded-arkaic-button bg-arkaic-background items-center justify-center"
              >
                <ImageIcon size={28} className="text-arkaic-muted" />
              </View>
            ))
            .otherwise((photo) => (
              <Image
                source={{ uri: `${UPLOADS_BASE_URL}/listings/${listing.id}/${photo.filename}` }}
                className="aspect-square rounded-arkaic-button"
                style={{ width: 80, height: 80 }}
                contentFit="cover"
                placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
                transition={200}
              />
            ))}

          <VStack className='justify-between flex-shrink-0 w-full' space={"md"}>
            <VStack>
              <Small>{listing.seller?.username}</Small>
              <Large>{listing.name}</Large>
            </VStack>
            {listing.category && (
              <HStack space='xs' className='flex-wrap'>
                <CategoryBadge category={listing.category} />
              </HStack>
            )}
            <AmountComponent size='4xl' amount={listing.price} />
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}
