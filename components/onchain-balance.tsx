import { useBalance } from "@/hooks/use-balance";

import { Link2 } from "lucide-react-native";
import { AmountComponent } from "./amount";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";

export function OnchainBalance() {
  const { data } = useBalance();

  return (
    <Card variant={"ghost"} className='justify-between aspect-[3/2]'>
      <VStack
        className='items-center justify-center h-full my-auto'
        space={"sm"}
      >
        <AmountComponent amount={data?.boarding.confirmed} size='5xl' />
        <Badge action={"warning"} className='w-max'>
          <BadgeIcon as={Link2} />
          <BadgeText>Onchain</BadgeText>
        </Badge>
      </VStack>
    </Card>
  );
}
