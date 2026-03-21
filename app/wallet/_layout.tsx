import NavigationMenu from "@/components/navigation-menu";
import { VStack } from "@/components/ui/vstack";
import { Slot } from "expo-router";

export default function AccountLayout() {
  return (
    <VStack className='h-full' space={"lg"}>
      <Slot />
      <NavigationMenu />
    </VStack>
  );
}
