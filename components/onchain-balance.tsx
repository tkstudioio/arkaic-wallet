import { useBalance } from "@/hooks/use-balance";

import { Link2 } from "lucide-react-native";
import { AmountComponent } from "./amount";
import { OnboardButton } from "./onboard-button";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";

export function OnchainBalance() {
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
        <AmountComponent amount={data?.boarding.confirmed} size='5xl' />
      </VStack>

      <VStack className='items-end'>
        <Badge action={"warning"} className='w-max' size={"xl"}>
          <BadgeIcon as={Link2} />
          <BadgeText>Onchain</BadgeText>
        </Badge>
      </VStack>
      <OnboardButton />
    </Card>
  );
}
