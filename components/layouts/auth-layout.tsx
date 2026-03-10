import LogoFull from "@/components/icons/logo";
import { VStack } from "@/components/ui/vstack";
import { PropsWithChildren } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthLayout(props: PropsWithChildren) {
  const { top } = useSafeAreaInsets();
  const paddingTop = Platform.OS === "web" && top === 0 ? 16 : top;

  return (
    <VStack
      className='items-center bg-arkaic-background h-full px-arkaic-md pb-arkaic-lg'
      space={"4xl"}
      style={{ paddingTop }}
    >
      <VStack className='items-center text-arkaic-foreground'>
        <LogoFull height={32} width={246} />
      </VStack>
      <VStack className='flex-1 w-full'>{props.children}</VStack>
    </VStack>
  );
}
