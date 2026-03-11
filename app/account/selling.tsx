import { ProductsListItem } from "@/components/products-list-item";
import { Grid, GridItem } from "@/components/ui/grid";
import { Spinner } from "@/components/ui/spinner";
import { H1, P } from "@/components/ui/typography";
import { useAccountSellingProducts } from "@/hooks/products/use-account-products";
import { map } from "lodash";

import { match } from "ts-pattern";

export default function ProductsList() {
  const productsQuery = useAccountSellingProducts();

  return (
    <>
      <H1 className='font-heading'>Selling</H1>
      {match(productsQuery)
        .with({ isLoading: true }, () => <Spinner className='mt-4' />)
        .with({ isError: true }, () => (
          <P className='text-arkaic-negative'>Failed to load products.</P>
        ))
        .otherwise(({ data }) => (
          <Grid className='gap-4' _extra={{ className: "grid-cols-2" }}>
            {map(data, (product) => (
              <GridItem key={product.id} _extra={{ className: "" }}>
                <ProductsListItem product={product} />
              </GridItem>
            ))}
          </Grid>
        ))}
    </>
  );
}
