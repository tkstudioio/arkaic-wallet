import { Card } from "@/components/ui/card";
import { Large, Small } from "@/components/ui/typography";
import { Listing } from "@/types/backend";
import { Link } from "expo-router";
import { AmountComponent } from "./amount";
import { CategoryBadge } from "./category-badge";
import { HStack } from "./ui/hstack";
import { Skeleton } from "./ui/skeleton";
import { VStack } from "./ui/vstack";

export function ListingItem({ listing }: { listing: Listing }) {
  return (
    <Link
      className='w-full'
      key={listing.id}
      href={{
        pathname: "/listings/[id]",
        params: { id: listing.id },
      }}
    >
      <Card className='justify-start'>
        <HStack space={"md"}>
          <Skeleton className='h-full aspect-square w-max' />

          <VStack className='justify-between' space={"md"}>
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
    </Link>
  );
}
