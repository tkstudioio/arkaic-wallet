import { useBalance } from "@/hooks/use-balance";

import { AmountComponent } from "./amount";
import { Badge, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";

export function OnchainBalance() {
  const { data } = useBalance();

  return (
    <Card
      variant={"elevated"}
      className='justify-between aspect-[3/2] bg-background-0 rounded-[20px] mx-6 py-12 my-auto'
    >
      <VStack className='items-center my-auto'>
        <AmountComponent amount={data?.available} size='4xl' />

        <Badge action={"warning"}>
          <BadgeText>Onchain protocol</BadgeText>
        </Badge>
      </VStack>
    </Card>
  );
}
