import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import LogoFull from "../icons/logo";
import { Button } from "../ui/button";
import { VStack } from "../ui/vstack";

export default function AppLayout(props: PropsWithChildren) {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <ScrollView className='px-6 pt-20 pb-24'>
        <VStack space={"xl"}>
          <View className='mb-3 flex-row justify-between items-end w-full  '>
            <LogoFull
              height={32}
              width={128}
              className='flex-1 w-full fill-background-0'
            />
            <Button variant='link' className='flex'>
              {/* <Settings color={colors.text} /> */}
            </Button>
          </View>
          {props.children}
        </VStack>
      </ScrollView>
    </QueryClientProvider>
  );
}
