import { Text } from "@/components/ui/text";
import { useBalance } from "@/hooks/use-balance";
import useProfileStore from "@/stores/profile";
import { useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeftRight, Link, Plus, Send } from "lucide-react-native";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function ArkBalance() {
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
      onPress: () => router.push("/dashboard/onchain"),
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
              <Badge action='info'>
                <HStack space={"sm"} className='items-center'>
                  <BadgeText>{profile?.name}</BadgeText>
                  <Avatar size={"xs"}>
                    <AvatarFallbackText>-</AvatarFallbackText>
                    <AvatarImage source={{ uri: profile?.avatar }} />
                  </Avatar>
                </HStack>
              </Badge>
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
            <VStack className='items-center' space={"md"}>
              <VStack className='items-center'>
                <Heading>Failed to load profile </Heading>
                <Text>{error?.message}</Text>;
              </VStack>
              <Button
                onPress={handleChangeProfile}
                action='secondary'
                className='rounded-full'
                size={"sm"}
              >
                <ButtonText>Change profile</ButtonText>
                <ButtonIcon as={ArrowLeftRight} />
              </Button>
            </VStack>
          );
        })}
    </View>
  );
}
