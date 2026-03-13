import { Card } from "@/components/ui/card";

import { Large } from "@/components/ui/typography";

import { Link } from "expo-router";

import { Listing } from "@/types/backend";
import { AmountComponent } from "./amount";
import { Badge, BadgeText } from "./ui/badge";
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
      <Card className='justify-start w-full'>
        <Skeleton className='w-full h-max aspect-square' />

        <Badge size={"lg"}>
          <BadgeText>{listing.seller?.username}</BadgeText>
        </Badge>

        <Large>{listing.name}</Large>

        <VStack className='w-full items-end'>
          <AmountComponent size='4xl' amount={listing.price} />
        </VStack>
      </Card>
    </Link>
  );
}
