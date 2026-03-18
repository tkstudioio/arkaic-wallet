import { ListingItem } from "@/components/listing-item";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { H1, P } from "@/components/ui/typography";
import { useCategories } from "@/hooks/categories/use-categories";
import { useListings } from "@/hooks/listings/use-listings";
import { map } from "lodash";
import { useState } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

export default function ProductsList() {
  const categoriesQuery = useCategories();
  const productsQuery = useListings();

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);

  const filteredListings = selectedCategorySlug
    ? productsQuery.data?.filter((listing) => {
        console.log(listing.categoryId);
        return listing.category?.slug === selectedCategorySlug;
      })
    : productsQuery.data;

  console.log("prova");
  return (
    <>
      <H1 className='font-heading'>Listings</H1>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='mb-2'
      >
        {match(categoriesQuery)
          .with({ isLoading: true }, () => null)
          .otherwise(({ data }) => (
            <HStack space={"md"}>
              <Button
                action={!selectedCategorySlug ? "primary" : "neutral"}
                onPress={() => setSelectedCategorySlug(null)}
                variant={"outline"}
                size={"sm"}
                className='w-max'
              >
                <ButtonText>All</ButtonText>
              </Button>
              {map(data, (category) => (
                <Button
                  action={
                    category.slug === selectedCategorySlug
                      ? "primary"
                      : "neutral"
                  }
                  onPress={() => setSelectedCategorySlug(category.slug)}
                  variant={"outline"}
                  key={category.slug}
                  size={"sm"}
                  className='w-max'
                >
                  <ButtonText>{category.name}</ButtonText>
                </Button>
              ))}
            </HStack>
          ))}
      </ScrollView>

      {match(productsQuery)
        .with({ isLoading: true }, () => <Spinner className='mt-4' />)
        .with({ isError: true }, () => (
          <P className='text-arkaic-negative'>Failed to load products.</P>
        ))
        .otherwise(() =>
          map(filteredListings, (listing) => (
            <ListingItem listing={listing} key={listing.id} />
          )),
        )}
    </>
  );
}
