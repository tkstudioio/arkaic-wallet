import NavigationMenu from "@/components/navigation-menu";
import { VStack } from "@/components/ui/vstack";
import { Slot } from "expo-router";

export default function CategoriesLayout() {
  return (
    <VStack className='h-full' space={"lg"}>
      <VStack className='flex-1'>
        <Slot />
      </VStack>
      <NavigationMenu />
    </VStack>
  );
}
