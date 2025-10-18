import { useBalance } from "@/hooks/use-balance";

import { AmountComponent } from "./amount";
import { Badge, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

export function ArkBalanceCard() {
  const { data } = useBalance();

  return (
    <Card
      variant={"elevated"}
      className='justify-between aspect-[3/2] bg-background-0 rounded-[20px] mx-6 py-12 my-auto'
    >
      <VStack className='items-center my-auto' space={"sm"}>
        <AmountComponent amount={data?.available} size='4xl' />
        <Badge action={"success"} className='w-max'>
          <BadgeText>Ark protocol</BadgeText>
        </Badge>
      </VStack>

      <HStack className='justify-around'></HStack>
    </Card>
  );
}
