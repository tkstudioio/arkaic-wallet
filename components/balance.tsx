import { Text } from "@/components/ui/text";
import { useBalance } from "@/hooks/use-balance";
import useProfileStore from "@/stores/wallet";
import { useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeftRight, Link, Plus, Send } from "lucide-react-native";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function BalanceComponent() {
  const { profile, logout } = useProfileStore();
  const balanceQuery = useBalance();
  const router = useRouter();

  const actions = [
    {
      onPress: () => router.push("/dashboard/receive"),
      icon: Plus,
      label: "Receive",
    },
    {
      onPress: () => router.push("/dashboard/send"),
      icon: Send,
      label: "Send",
    },
    {
      onPress: () => router.push("/dashboard/onboard-funds"),
      icon: Link,
      label: "Onchain",
    },
  ];

  function handleChangeProfile() {
    logout();
    router.replace("/");
  }
  return (
    <View className='gap-6'>
      {match(balanceQuery)
        .with({ isSuccess: true }, ({ data }) => (
          <Card
            variant={"ghost"}
            className='gap-12 aspect-square justify-between'
          >
            <VStack space={"lg"} className='items-center my-auto'>
              <HStack space={"sm"} className='items-center'>
                <Text>{profile?.name}</Text>
                <Avatar size={"xs"}>
                  <AvatarImage source={{ uri: profile?.avatar }} />
                  <AvatarFallbackText>ND</AvatarFallbackText>
                </Avatar>
              </HStack>
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
                <ButtonText>Profiles</ButtonText>
                <ButtonIcon as={ArrowLeftRight} />
              </Button>
            </VStack>

            <HStack className='justify-around'>
              {map(actions, (action, idx) => (
                <VStack key={idx} className='items-center'>
                  <Button
                    action={"secondary"}
                    className='flex-col h-max rounded-full size-14'
                    onPress={action.onPress}
                  >
                    <ButtonIcon as={action.icon} />
                  </Button>
                  <Text>{action.label}</Text>
                </VStack>
              ))}
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
