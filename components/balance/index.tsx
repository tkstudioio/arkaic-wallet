import { Text } from "@/components/ui/text";
import { useBalance } from "@/hooks/use-balance";
import useProfileStore from "@/stores/wallet";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { CircleFadingArrowUp, Plus, Send } from "lucide-react-native";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Avatar, AvatarFallbackText, AvatarImage } from "../ui/avatar";
import { Button, ButtonIcon } from "../ui/button";
import { Card } from "../ui/card";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Spinner } from "../ui/spinner";
import { VStack } from "../ui/vstack";

export function BalanceComponent() {
  const { profile, logout } = useProfileStore();
  const balanceQuery = useBalance();
  const { colors } = useTheme();
  const router = useRouter();

  function handleChangeProfile() {
    logout();
    router.replace("/");
  }
  return (
    <View className='gap-6'>
      {match(balanceQuery)
        .with({ isSuccess: true }, ({ data }) => (
          <Card variant={"ghost"} className='gap-12'>
            <VStack space={"sm"} className='items-center'>
              <HStack className='items-baseline' space={"sm"}>
                <Heading size='4xl'>
                  {Intl.NumberFormat("it-IT").format(data.available || 0)}
                </Heading>
                <Text>SATS</Text>
              </HStack>
              <Button
                onPress={handleChangeProfile}
                action={"secondary"}
                variant={"outline"}
                size={"sm"}
                className='rounded-full'
              >
                <HStack space={"sm"} className='items-center'>
                  <Text>{profile?.name}</Text>
                  <Avatar size={"xs"}>
                    <AvatarImage source={{ uri: profile?.avatar }} />
                    <AvatarFallbackText>ND</AvatarFallbackText>
                  </Avatar>
                </HStack>
              </Button>
            </VStack>

            <HStack className='justify-around'>
              <VStack className='items-center'>
                <Button
                  action={"secondary"}
                  className='flex-col h-max rounded-full size-14'
                  onPress={() => router.push("/dashboard/receive")}
                >
                  <Plus color={colors.text} />
                </Button>
                <Text>Receive</Text>
              </VStack>
              <VStack className='items-center'>
                <Button
                  action={"secondary"}
                  className='flex-col h-max rounded-full size-14'
                  onPress={() => router.push("/dashboard/send")}
                >
                  <Send color={colors.text} />
                </Button>
                <Text>Send</Text>
              </VStack>
              <VStack className='items-center relative'>
                <Button
                  action={"secondary"}
                  className='flex-col h-max rounded-full size-14'
                  onPress={() => router.push("/dashboard/onboard-funds")}
                >
                  <ButtonIcon as={CircleFadingArrowUp} />
                </Button>
                <Text>Onboard</Text>
              </VStack>
            </HStack>
          </Card>
        ))
        .with({ isLoading: true }, () => <Spinner />)
        .otherwise(({ error }) => {
          return (
            <View>
              <Heading>Failed to load profile </Heading>
              <Text>{error?.message}</Text>;
            </View>
          );
        })}
    </View>
  );
}
