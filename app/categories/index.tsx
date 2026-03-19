import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Large, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategories } from "@/hooks/categories/use-categories";
import { Link } from "expo-router";
import { map } from "lodash";
import { match } from "ts-pattern";

export default function CategoriesIndex() {
  const categoriesQuery = useCategories();

  return (
    <VStack space={"md"}>
      <Large>All products</Large>
      <VStack>
        {match(categoriesQuery)
          .with({ isLoading: true }, () => <Spinner />)
          .with({ isError: true }, () => (
            <Small className='text-arkaic-negative'>
              Failed to load categories.
            </Small>
          ))
          .otherwise(({ data }) => (
            <HStack space={"md"}>
              {map(data, (category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  asChild
                >
                  <Button
                    variant='outline'
                    action={"neutral"}
                    size='sm'
                    className='w-max'
                  >
                    <ButtonText>{category.name}</ButtonText>
                  </Button>
                </Link>
              ))}
            </HStack>
          ))}
      </VStack>
    </VStack>
  );
}
