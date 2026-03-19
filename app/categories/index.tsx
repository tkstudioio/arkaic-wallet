import { ListingItem } from "@/components/listing-item";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategories } from "@/hooks/categories/use-categories";
import { useListings } from "@/hooks/listings/use-listings";
import { Category } from "@/types/backend";
import { Link } from "expo-router";
import { map } from "lodash";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

// Flatten nested categories to include all (root + subcategories)
function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];

  for (const cat of categories) {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      result.push(...cat.children);
    }
  }

  return result;
}

export default function CategoriesIndex() {
  const categoriesQuery = useCategories();
  const listingsQuery = useListings();

  return (
    <VStack space={"md"}>
      <Large>All products</Large>

      {/* Categories */}
      <VStack space="sm">
        <P className="text-sm text-arkaic-muted">Browse by category</P>
        {match(categoriesQuery)
          .with({ isLoading: true }, () => <Spinner />)
          .with({ isError: true }, () => (
            <Small className='text-arkaic-negative'>
              Failed to load categories.
            </Small>
          ))
          .otherwise(({ data }) => {
            const allCategories = flattenCategories(data || []);
            return (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerClassName='flex-row gap-2'
              >
                {map(allCategories, (category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    asChild
                  >
                    <Button
                      variant='outline'
                      action={category.childrenOf ? "neutral" : "neutral"}
                      size='sm'
                      className='w-max'
                    >
                      <ButtonText>{category.name}</ButtonText>
                    </Button>
                  </Link>
                ))}
              </ScrollView>
            );
          })}
      </VStack>

      {/* All Listings */}
      <VStack space="sm">
        <P className="text-sm text-arkaic-muted">Latest listings</P>
        {match(listingsQuery)
          .with({ isLoading: true }, () => <Spinner size="small" />)
          .with({ isError: true }, () => (
            <Small className='text-arkaic-negative'>
              Failed to load listings.
            </Small>
          ))
          .otherwise(({ data: listings }) =>
            listings && listings.length > 0 ? (
              <VStack space='md'>
                {map(listings, (listing) => (
                  <ListingItem key={listing.id} listing={listing} />
                ))}
              </VStack>
            ) : (
              <Small className='text-arkaic-muted'>
                No listings available.
              </Small>
            ),
          )}
      </VStack>
    </VStack>
  );
}
