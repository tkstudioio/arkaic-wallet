import LogoFull from "@/components/icons/logo";
import { VStack } from "@/components/ui/vstack";
import useProfileStore from "@/stores/profile";
import { IncomingFunds } from "@arkade-os/sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";

export default function AppLayout(props: PropsWithChildren) {
  const { wallet } = useProfileStore();
  const client = useMemo(() => new QueryClient(), []);

  const handleNotification = useCallback(
    function handleNotification(notification: IncomingFunds) {
      console.log("Mi rompo qua");
      client.invalidateQueries({
        queryKey: ["balance"],
      });
      client.invalidateQueries({
        queryKey: ["ark-transactions"],
      });
      client.invalidateQueries({
        queryKey: ["onchain-transactions"],
      });
    },
    [client]
  );

  useEffect(() => {
    wallet?.notifyIncomingFunds(handleNotification);
  }, [wallet, handleNotification]);

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
            {/* <Button variant='link' className='flex'>
              <ButtonText>Settings</ButtonText>
              <ButtonIcon as={Settings} />
            </Button> */}
          </View>
          {props.children}
        </VStack>
      </ScrollView>
    </QueryClientProvider>
  );
}
