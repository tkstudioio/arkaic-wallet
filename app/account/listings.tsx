import { ListingItem } from "@/components/listing-item";
import NavigationMenu from "@/components/navigation-menu";
import { Spinner } from "@/components/ui/spinner";
import { H1, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useMyListings } from "@/hooks/listings/use-my-listings";
import { map } from "lodash";
import { ScrollView } from "react-native";

import { match } from "ts-pattern";

export default function Selling() {
  const productsQuery = useMyListings();

  return (
    <VStack className='h-full'>
      <ScrollView className='flex-1'>
        <VStack space='lg'>
          <H1 className='font-heading'>Selling</H1>
          {match(productsQuery)
            .with({ isLoading: true }, () => <Spinner className='mt-4' />)
            .with({ isError: true }, () => (
              <P className='text-arkaic-negative'>Failed to load products.</P>
            ))
            .otherwise(({ data }) =>
              map(data, (listing) => (
                <ListingItem listing={listing} key={listing.id} />
              )),
            )}
        </VStack>
      </ScrollView>
      <NavigationMenu />
    </VStack>
  );
}
