import { ListingItem } from "@/components/listing-item";
import { Spinner } from "@/components/ui/spinner";
import { H1, P } from "@/components/ui/typography";
import { useListings } from "@/hooks/listings/use-listings";
import { map } from "lodash";

import { match } from "ts-pattern";

export default function ProductsList() {
  const productsQuery = useListings();

  return (
    <>
      <H1 className='font-heading'>Listings</H1>
      {match(productsQuery)
        .with({ isLoading: true }, () => <Spinner className='mt-4' />)
        .with({ isError: true }, () => (
          <P className='text-arkaic-negative'>Failed to load products.</P>
        ))
        .otherwise(({ data }) =>
          map(data, (listing) => (
            <ListingItem key={listing.id} listing={listing} />
          )),
        )}
    </>
  );
}
