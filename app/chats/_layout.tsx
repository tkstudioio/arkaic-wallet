import { VStack } from "@/components/ui/vstack";
import { useWebSocket } from "@/hooks/use-websocket";

import { Slot } from "expo-router";

export default function ProductsLayout() {
  useWebSocket();

  return (
    <VStack className='h-full' space={"lg"}>
      <VStack className='h-full' space={"lg"}>
        <Slot />
      </VStack>
    </VStack>
  );
}
