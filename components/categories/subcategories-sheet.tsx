import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Category } from "@/types/backend";
import { Link } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

type SubcategoriesSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  parent?: Category | null;
  subcategories: Category[];
};

export function SubcategoriesSheet({
  isOpen,
  onClose,
  parent,
  subcategories,
}: SubcategoriesSheetProps) {
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className='max-h-[60%]'>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetScrollView className='w-full'>
          <VStack space='md' className='p-4 pb-8'>
            <Link
              href={parent ? `/categories/${parent.slug}` : "/categories"}
              asChild
              className='w-max'
            >
              <Button
                className='w-min justify-start'
                onPress={onClose}
                variant={"link"}
              >
                <ButtonIcon as={ChevronLeft} />
                <ButtonText>
                  {parent ? parent.name : "All categories"}
                </ButtonText>
              </Button>
            </Link>
            {subcategories.map((child) => (
              <Link key={child.slug} href={`/categories/${child.slug}`} asChild>
                <Button
                  variant='link'
                  action='neutral'
                  className='w-full justify-between'
                  onPress={onClose}
                >
                  <ButtonText>{child.name}</ButtonText>
                  <ButtonIcon as={ChevronRight} />
                </Button>
              </Link>
            ))}
          </VStack>
        </ActionsheetScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
}
