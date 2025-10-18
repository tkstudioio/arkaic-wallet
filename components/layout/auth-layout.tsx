import LogoFull from "@/components/icons/logo";
import { VStack } from "@/components/ui/vstack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";
import { View } from "react-native";

export default function AuthLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <VStack className='my-auto items-center px-4' space={"4xl"}>
        <View className='mb-3 flex-row justify-between items-center'>
          <LogoFull
            height={32}
            width={128}
            className='flex-1 w-full fill-background-0'
          />
        </View>
        {props.children}
      </VStack>
    </QueryClientProvider>
  );
}
