import { useBalance } from "@/hooks/use-balance";

import { useRouter } from "expo-router";
import { map } from "lodash";
import { Plus, Send, Triangle } from "lucide-react-native";
import { AmountComponent } from "./amount";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Button, ButtonIcon } from "./ui/button";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function AccountBalance() {
  const router = useRouter();
  const { data } = useBalance();

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
    <VStack className='h-full'>
      <Card variant={"ghost"} className='flex-1'>
        <VStack className='items-center my-auto' space={"sm"}>
          <AmountComponent amount={data?.available} size='5xl' />
          <Badge action={"success"} className='w-max'>
            <BadgeIcon as={Triangle} />
            <BadgeText>Ark</BadgeText>
          </Badge>
        </VStack>
      </Card>

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
    </VStack>
  );
}
