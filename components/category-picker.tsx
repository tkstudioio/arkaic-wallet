import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategories } from "@/hooks/categories/use-categories";
import { useCategory } from "@/hooks/categories/use-category";
import { Category } from "@/types/backend";
import { find } from "lodash";
import { useState } from "react";
import { match } from "ts-pattern";

type Props = {
  onSelect: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
};

type CategoryLevelProps = {
  parentCategory: Category;
  onSelect: (categoryId: number) => void;
};

function CategoryLevel({ parentCategory, onSelect }: CategoryLevelProps) {
  const categoryQuery = useCategory(parentCategory.slug);
  const [selectedChildSlug, setSelectedChildSlug] = useState<string | null>(
    null,
  );

  const children = categoryQuery.data?.children ?? parentCategory.children ?? [];

  const selectedChild = selectedChildSlug
    ? find(children, (c) => c.slug === selectedChildSlug)
    : undefined;

  function handleChange(value: string) {
    const child = find(children, (c) => String(c.id) === value);
    if (!child) return;

    setSelectedChildSlug(child.slug);
    onSelect(child.id);
  }

  return match(categoryQuery)
    .with({ isLoading: true }, () => <Spinner />)
    .with({ isError: true }, () => (
      <Small className="text-arkaic-negative">Failed to load subcategories.</Small>
    ))
    .otherwise(() => {
      if (children.length === 0) return null;

      return (
        <VStack space="xs">
          <Select
            selectedValue={selectedChild ? String(selectedChild.id) : undefined}
            onValueChange={handleChange}
          >
            <SelectTrigger>
              <SelectInput placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectScrollView>
                  {children.map((child) => (
                    <SelectItem
                      key={child.id}
                      label={child.name}
                      value={String(child.id)}
                    />
                  ))}
                </SelectScrollView>
              </SelectContent>
            </SelectPortal>
          </Select>

          {selectedChild && (
            <CategoryLevel
              key={selectedChild.slug}
              parentCategory={selectedChild}
              onSelect={onSelect}
            />
          )}
        </VStack>
      );
    });
}

export function CategoryPicker({ onSelect, selectedCategoryId }: Props) {
  const categoriesQuery = useCategories();
  const [selectedRootId, setSelectedRootId] = useState<number | null>(null);

  const selectedRoot: Category | undefined = find(
    categoriesQuery.data,
    (c) => c.id === selectedRootId,
  );

  function handleRootChange(value: string) {
    const rootId = Number(value);
    setSelectedRootId(rootId);

    const root = find(categoriesQuery.data, (c) => c.id === rootId);
    if (!root) return;

    onSelect(root.id);
  }

  return (
    <VStack space="xs">
      {match(categoriesQuery)
        .with({ isLoading: true }, () => <Spinner />)
        .with({ isError: true }, () => (
          <Small className="text-arkaic-negative">
            Failed to load categories.
          </Small>
        ))
        .otherwise(({ data }) => (
          <VStack space="xs">
            <Small>Category</Small>
            <Select
              selectedValue={
                selectedRootId ? String(selectedRootId) : undefined
              }
              onValueChange={handleRootChange}
            >
              <SelectTrigger>
                <SelectInput placeholder="Select a category" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectScrollView>
                    {(data ?? []).map((category) => (
                      <SelectItem
                        key={category.id}
                        label={category.name}
                        value={String(category.id)}
                      />
                    ))}
                  </SelectScrollView>
                </SelectContent>
              </SelectPortal>
            </Select>

            {selectedRoot && (selectedRoot.children?.length ?? 0) > 0 && (
              <CategoryLevel
                key={selectedRoot.slug}
                parentCategory={selectedRoot}
                onSelect={onSelect}
              />
            )}
          </VStack>
        ))}
    </VStack>
  );
}
