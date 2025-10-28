import LogoFull from "@/components/icons/logo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";
import { ScrollView } from "react-native";
import { VStack } from "../ui/vstack";

export default function AppLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <ScrollView className='pt-24 pb-24'>
        <VStack space={"4xl"} className='items-center'>
          <LogoFull height={24} width={100} className='flex-1' />
          {props.children}
        </VStack>
      </ScrollView>
    </QueryClientProvider>
  );
}
