import { VStack } from "@/components/ui/vstack";

import { Slot } from "expo-router";

export default function ProductsLayout() {
  return (
    <VStack className='h-full' space={"lg"}>
      <VStack className='h-full' space={"lg"}>
        <Slot />
      </VStack>
    </VStack>
  );
}
