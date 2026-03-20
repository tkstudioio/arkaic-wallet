import { Card } from "@/components/ui/card";
import { Large, Small } from "@/components/ui/typography";
import { useIsFavorite } from "@/hooks/favorites/use-is-favorite";
import { useToggleFavorite } from "@/hooks/favorites/use-toggle-favorite";
import { Listing } from "@/types/backend";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { Pressable } from "react-native";
import { AmountComponent } from "./amount";
import { CategoryBadge } from "./category-badge";
import { HStack } from "./ui/hstack";
import { Skeleton } from "./ui/skeleton";
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
          <Skeleton className='h-max w-max aspect-square' />

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
