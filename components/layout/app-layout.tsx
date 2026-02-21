import LogoFull from "@/components/icons/logo";
import useProfileStore from "@/stores/profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { PowerOff } from "lucide-react-native";
import { PropsWithChildren, useMemo } from "react";
import { ScrollView } from "react-native";
import ToastManager from "toastify-react-native";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";
import { VStack } from "../ui/vstack";
export default function AppLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);
  const router = useRouter();
  const { profile } = useProfileStore();
  return (
    <QueryClientProvider client={client}>
      <ScrollView className='pt-24 pb-24 bg-arkaic-background'>
        <VStack space={"4xl"} className='items-center'>
          <HStack className='items-center justify-between w-full px-arkaic-md'>
            <LogoFull height={24} width={100} className='flex-1' />
            <Button
              action={"negative"}
              variant={"link"}
              onPress={() => router.replace("/")}
              className='w-min'
              size={"xs"}
            >
              <ButtonText>{profile?.name}</ButtonText>
              <ButtonIcon as={PowerOff} />
            </Button>
          </HStack>

          {props.children}
        </VStack>
      </ScrollView>
      <ToastManager />
    </QueryClientProvider>
  );
}
