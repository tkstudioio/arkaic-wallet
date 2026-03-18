import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategories } from "@/hooks/categories/use-categories";
import { Category } from "@/types/backend";
import { find } from "lodash";
import { useState } from "react";
import { match } from "ts-pattern";

type Props = {
  onSelect: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
};

export function CategoryPicker({ onSelect, selectedCategoryId }: Props) {
  const categoriesQuery = useCategories();
  const [selectedRootId, setSelectedRootId] = useState<number | null>(null);

  const selectedRoot: Category | undefined = find(
    categoriesQuery.data,
    (c) => c.id === selectedRootId,
  );

  const hasChildren =
    selectedRoot?.children && selectedRoot.children.length > 0;

  function handleRootChange(value: string) {
    const rootId = Number(value);

    setSelectedRootId(rootId);

    const root = find(categoriesQuery.data, (c) => c.id === rootId);
    if (!root) return;

    if (!root.children || root.children.length === 0) {
      onSelect(root.id);
    } else {
      onSelect(null);
    }
  }

  function handleSubcategoryChange(value: string) {
    onSelect(Number(value));
  }

  return (
    <VStack space='xs'>
      {match(categoriesQuery)
        .with({ isLoading: true }, () => <Spinner />)
        .with({ isError: true }, () => (
          <Small className='text-arkaic-negative'>
            Failed to load categories.
          </Small>
        ))
        .otherwise(({ data }) => (
          <VStack space='xs'>
            <Small>Category</Small>
            <Select
              selectedValue={
                selectedRootId ? String(selectedRootId) : undefined
              }
              onValueChange={(v) => {
                console.log(v);
                handleRootChange(v);
              }}
            >
              <SelectTrigger>
                <SelectInput placeholder='Select a category' />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {(data ?? []).map((category) => (
                    <SelectItem
                      key={category.id}
                      label={category.name}
                      value={String(category.id)}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>

            {hasChildren && (
              <VStack space='xs'>
                <Small>Subcategory</Small>
                <Select
                  selectedValue={
                    selectedCategoryId ? String(selectedCategoryId) : undefined
                  }
                  onValueChange={handleSubcategoryChange}
                >
                  <SelectTrigger>
                    <SelectInput placeholder='Select a subcategory' />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {(selectedRoot?.children ?? []).map((child) => (
                        <SelectItem
                          key={child.id}
                          label={child.name}
                          value={String(child.id)}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>
            )}
          </VStack>
        ))}
    </VStack>
  );
}
