import { ListingItem } from "@/components/listing-item";
import NavigationMenu from "@/components/navigation-menu";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Muted, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategories } from "@/hooks/categories/use-categories";
import { useFavorites } from "@/hooks/favorites/use-favorites";
import { Category } from "@/types/backend";

import { Link } from "expo-router";
import { icons, Search, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { match } from "ts-pattern";

function getCategoryIcon(iconName: string | null): LucideIcon | null {
  if (!iconName) return null;
  const pascalCase = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return (icons as Record<string, LucideIcon>)[pascalCase] ?? null;
}

function CategoryButton({ category }: { category: Category }) {
  const IconComponent = getCategoryIcon(category.iconName);
  const color = category.color ?? "#6b7280";

  return (
    <Link href={`/categories/${category.slug}`} asChild>
      <Button
        className='flex-col aspect-square '
        variant={"outline"}
        size={"lg"}
        style={{ borderColor: color }}
      >
        {IconComponent && <ButtonIcon as={IconComponent} color={color} />}
        <ButtonText className='text-center' style={{ color }}>
          {category.name}
        </ButtonText>
      </Button>
    </Link>
  );
}

export default function Listings() {
  const categoriesQuery = useCategories();
  const favoritesQuery = useFavorites();
  const [search, setSearch] = useState("");

  return (
    <VStack className='h-full'>
      <VStack className='flex-1'>
        <VStack space='xl'>
          {/* Search bar */}
          <Input size='xl'>
            <InputField
              placeholder='Search listings...'
              value={search}
              onChangeText={setSearch}
              returnKeyType='search'
            />
            <InputIcon as={Search} />
          </Input>

          {/* Categories */}
          <VStack space='sm'>
            <HStack space={"lg"}>
              {match(categoriesQuery)
                .with({ isLoading: true }, () => <Spinner />)
                .with({ isError: true }, () => (
                  <Muted>Failed to load categories.</Muted>
                ))
                .otherwise(({ data: categories }) =>
                  categories?.map((category) => (
                    <View key={category.slug} className='aspect-square flex-1'>
                      <CategoryButton category={category} />
                    </View>
                  )),
                )}
            </HStack>
          </VStack>

          <ScrollView className='flex-1'>
            {/* Favorites */}
            <VStack space='sm'>
              <P className='font-heading text-arkaic-foreground'>Favorites</P>
              {match(favoritesQuery)
                .with({ isLoading: true }, () => <Spinner />)
                .with({ isError: true }, () => (
                  <Muted>Failed to load favorites.</Muted>
                ))
                .otherwise(({ data }) =>
                  data && data.length > 0 ? (
                    <View className='flex-row flex-wrap gap-3'>
                      {data.map((fav) => (
                        <View key={fav.id} className='flex-1 min-w-[45%]'>
                          <ListingItem listing={fav.listing} />
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Muted>
                      No favorites yet. Tap the heart icon on a listing to save
                      it.
                    </Muted>
                  ),
                )}
            </VStack>
          </ScrollView>
        </VStack>
      </VStack>
      <NavigationMenu />
    </VStack>
  );
}
