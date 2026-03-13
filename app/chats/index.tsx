import { ListingItem } from "@/components/listing-item";
import { Grid, GridItem } from "@/components/ui/grid";
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
        .otherwise(({ data }) => (
          <Grid className='gap-4' _extra={{ className: "grid-cols-2" }}>
            {map(data, (listing) => (
              <GridItem key={listing.id} _extra={{ className: "" }}>
                <ListingItem listing={listing} />
              </GridItem>
            ))}
          </Grid>
        ))}
    </>
  );
}
