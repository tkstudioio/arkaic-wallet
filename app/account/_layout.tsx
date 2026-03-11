import NavigationMenu from "@/components/navigation-menu";
import { VStack } from "@/components/ui/vstack";
import { Slot } from "expo-router";
import { ScrollView } from "react-native";

export default function AccountLayout() {
  return (
    <VStack className='h-full' space={"lg"}>
      <ScrollView className='h-full rounded-arkaic-card relative'>
        <VStack className='h-full' space={"lg"}>
          <Slot />
        </VStack>
      </ScrollView>
      <NavigationMenu />
    </VStack>
  );
}
