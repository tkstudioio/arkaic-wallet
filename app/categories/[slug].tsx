import { AttributeChip } from "@/components/categories/attribute-chip";
import {
  AttributeField,
  AttributeFormValues,
} from "@/components/categories/attribute-field";
import { SubcategoriesSheet } from "@/components/categories/subcategories-sheet";
import { ListingItem } from "@/components/listing-item";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategory } from "@/hooks/categories/use-category";
import { useCategoryAttributes } from "@/hooks/categories/use-category-attributes";
import { useListingsByCategory } from "@/hooks/listings/use-listings-by-category";
import { useLocalSearchParams } from "expo-router";
import { filter, map } from "lodash";
import { List, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { match } from "ts-pattern";

export default function CategoryDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const categoryQuery = useCategory(slug);
  const attributesQuery = useCategoryAttributes(categoryQuery.data?.id);
  const { control, handleSubmit, watch } = useForm<AttributeFormValues>();
  const [showFilters, setShowFilters] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);

  const filterValues = watch();
  const listingsQuery = useListingsByCategory(
    categoryQuery.data?.id,
    filterValues,
  );

  const onSubmit = (values: AttributeFormValues) => {
    console.log("Category attribute form values:", values);
    setShowFilters(false);
  };

  const attributes = attributesQuery.data;
  const hasAttributes = attributes && attributes.length > 0;

  return (
    <VStack space='md' className='w-full'>
      {match(categoryQuery)
        .with({ isLoading: true }, () => (
          <View className='px-4'>
            <Spinner />
          </View>
        ))
        .with({ isError: true }, { isSuccess: true, data: undefined }, () => (
          <View className='px-4'>
            <Small className='text-arkaic-negative'>
              Failed to load category.
            </Small>
          </View>
        ))
        .otherwise(({ data: category }) => (
          <>
            {/* Breadcrumb */}
            <HStack className='items-center' space={"md"}>
              <Button
                variant={"link"}
                action={"neutral"}
                className='w-max'
                onPress={() => setShowSubcategories(true)}
              >
                <ButtonIcon as={List} />
              </Button>

              <Large>{category?.name}</Large>
            </HStack>

            {/* Filter bar */}
            <HStack className='items-center gap-2'>
              {/* Attribute chips — horizontal scroll */}
              {match(attributesQuery)
                .with({ isLoading: true }, () => <Spinner size='small' />)
                .with({ isError: true }, () => null)
                .otherwise(() =>
                  hasAttributes ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      nestedScrollEnabled={true}
                      contentContainerClassName='flex-row gap-2'
                      className='flex-1'
                    >
                      {map(
                        filter(
                          attributes,
                          ({ type }) =>
                            type === "select" || type === "multi_select",
                        ),
                        (attr) => (
                          <AttributeChip
                            key={attr.attributeId}
                            attr={attr}
                            control={control}
                          />
                        ),
                      )}
                    </ScrollView>
                  ) : (
                    <View className='flex-1' />
                  ),
                )}

              {/* Filters CTA */}
              {hasAttributes && (
                <Button
                  variant='outline'
                  action='primary'
                  size='sm'
                  className='w-max'
                  onPress={() => setShowFilters(true)}
                >
                  <ButtonIcon as={SlidersHorizontal} />
                </Button>
              )}
            </HStack>

            {/* Filters action sheet */}
            <Actionsheet
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
            >
              <ActionsheetBackdrop />
              <ActionsheetContent className='max-h-[60%]'>
                <ActionsheetDragIndicatorWrapper>
                  <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <ActionsheetScrollView className='w-full'>
                  <VStack space='md' className='p-4 pb-8'>
                    <P className='font-bold'>Filters</P>
                    {map(attributes, (attr) => (
                      <AttributeField
                        key={attr.attributeId}
                        attr={attr}
                        control={control}
                      />
                    ))}
                    <Button onPress={handleSubmit(onSubmit)}>
                      <ButtonText>Apply</ButtonText>
                    </Button>
                  </VStack>
                </ActionsheetScrollView>
              </ActionsheetContent>
            </Actionsheet>

            {/* Subcategories action sheet */}
            {category?.children && category.children.length > 0 && (
              <SubcategoriesSheet
                isOpen={showSubcategories}
                parent={category.parent}
                onClose={() => setShowSubcategories(false)}
                subcategories={category.children}
              />
            )}

            {/* Listings */}
            <VStack space='md'>
              {match(listingsQuery)
                .with({ isLoading: true }, () => <Spinner size='small' />)
                .with({ isError: true }, () => (
                  <Small className='text-arkaic-negative'>
                    Failed to load listings.
                  </Small>
                ))
                .otherwise(({ data: listings }) =>
                  listings && listings.length > 0 ? (
                    <ScrollView
                      className='flex-shrink-0'
                      contentContainerClassName='flex flex-col gap-4'
                    >
                      {map(listings, (listing) => (
                        <ListingItem key={listing.id} listing={listing} />
                      ))}
                    </ScrollView>
                  ) : (
                    <Small className='text-arkaic-muted'>
                      No listings found.
                    </Small>
                  ),
                )}
            </VStack>
          </>
        ))}
    </VStack>
  );
}
