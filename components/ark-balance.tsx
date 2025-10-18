import { useBalance } from "@/hooks/use-balance";

import { Triangle } from "lucide-react-native";
import { AmountComponent } from "./amount";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";

export function ArkBalanceCard() {
  const { data } = useBalance();

  return (
    <Card
      variant={"elevated"}
      className='justify-between aspect-[3/2] bg-background-0 rounded-[20px] mx-6 py-12 my-auto'
    >
      <VStack
        className='items-center justify-center h-full my-auto'
        space={"sm"}
      >
        <AmountComponent amount={data?.available} size='5xl' />
      </VStack>

      <VStack className='items-end'>
        <Badge action={"success"} className='w-max' size={"xl"}>
          <BadgeIcon as={Triangle} />
          <BadgeText>Ark</BadgeText>
        </Badge>
      </VStack>
    </Card>
  );
}
