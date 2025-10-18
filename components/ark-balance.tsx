import { Text } from "@/components/ui/text";
import { useBalance } from "@/hooks/use-balance";

import { useRouter } from "expo-router";
import { map } from "lodash";
import { ArrowLeftRight, ChevronRight, Plus, Send } from "lucide-react-native";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function ArkBalance() {
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
  ];

  return (
    <View className='gap-6'>
      {match(balanceQuery)
        .with({ isSuccess: true }, ({ data }) => (
          <Card
            variant={"ghost"}
            className='gap-12 aspect-square justify-between'
          >
            <VStack space={"lg"} className='items-center my-auto'>
              <HStack className='items-baseline' space={"sm"}>
                <Heading size='4xl'>
                  {Intl.NumberFormat("it-IT").format(data.available || 0)}
                </Heading>
                <Text>SATS</Text>
              </HStack>

              <Badge action={"success"}>
                <BadgeText>Ark protocol</BadgeText>
                <BadgeIcon as={ChevronRight} />
              </Badge>
            </VStack>

            <HStack className='justify-around'>
              {map(actions, (action, idx) => (
                <VStack key={idx} className='items-center w-max'>
                  <Button
                    action={"secondary"}
                    className='flex-col w-max h-max rounded-full size-14'
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
              <Button action='secondary' className='rounded-full' size={"sm"}>
                <ButtonText>Change profile</ButtonText>
                <ButtonIcon as={ArrowLeftRight} />
              </Button>
            </VStack>
          );
        })}
    </View>
  );
}
