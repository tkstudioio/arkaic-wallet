import LogoFull from "@/components/icons/logo";
import useProfileStore from "@/stores/profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ArrowLeftRight } from "lucide-react-native";
import { PropsWithChildren, useMemo } from "react";
import { ScrollView } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { HStack } from "../ui/hstack";

export default function AppLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);
  const router = useRouter();
  const { profile, logout } = useProfileStore();

  function onLogout() {
    logout();
    router.replace("/");
  }
  return (
    <QueryClientProvider client={client}>
      <ScrollView className='pt-24 pb-24 border'>
        <HStack className='justify-between items-center px-6'>
          <LogoFull height={24} width={100} className='flex-1' />
          <Button
            action='secondary'
            className='w-max rounded-full'
            size={"xs"}
            onPress={onLogout}
          >
            <HStack space={"sm"} className='items-center'>
              <ButtonIcon as={ArrowLeftRight} size={"sm"} />
              <ButtonText>{profile?.name}</ButtonText>
              <Avatar size={"xs"}>
                <AvatarFallbackText>-</AvatarFallbackText>
                <AvatarImage source={{ uri: profile?.avatar }} />
              </Avatar>
            </HStack>
          </Button>
        </HStack>

        {props.children}
      </ScrollView>
    </QueryClientProvider>
  );
}
