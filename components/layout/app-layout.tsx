import LogoFull from "@/components/icons/logo";
import { VStack } from "@/components/ui/vstack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";
import { ScrollView, View } from "react-native";

export default function AppLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <ScrollView className='px-6 pt-20 pb-24 '>
        <VStack space={"xl"}>
          <View className='mb-3 flex-row justify-between items-center'>
            <LogoFull
              height={32}
              width={128}
              className='flex-1 w-full fill-background-0'
            />
          </View>
          {props.children}
        </VStack>
      </ScrollView>
    </QueryClientProvider>
  );
}
