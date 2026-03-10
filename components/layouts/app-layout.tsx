import LogoFull from "@/components/icons/logo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";
import NavigationMenu from "../navigation-menu";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";

export default function AppLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <View className='flex-1 bg-arkaic-background'>
        <AppLayoutContent>{props.children}</AppLayoutContent>
        <NavigationMenu />
      </View>
      <ToastManager />
    </QueryClientProvider>
  );
}

function AppLayoutContent(props: PropsWithChildren) {
  const { top } = useSafeAreaInsets();
  const paddingTop = Platform.OS === "web" && top === 0 ? 16 : top;

  return (
    <View className='flex-1 bg-arkaic-background' style={{ paddingTop }}>
      <VStack space={"4xl"} className='items-center flex-1'>
        <HStack className='items-center justify-between w-full px-arkaic-md'>
          <LogoFull height={24} width={100} />
        </HStack>
        <ScrollView className='flex-1 p-4 w-full'>
          {props.children}
        </ScrollView>
      </VStack>
    </View>
  );
}
