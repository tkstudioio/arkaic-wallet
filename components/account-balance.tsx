import { useBalance } from "@/hooks/use-balance";

import { useWallet } from "@/hooks/use-wallet";
import { ArkaicProfile } from "@/types/arkaic";

import { AmountComponent } from "./amount";
import { Badge, BadgeText } from "./ui/badge";
import { Card } from "./ui/card";
import { VStack } from "./ui/vstack";

export function AccountBalance(props: { profile: ArkaicProfile }) {
  const wallet = useWallet(props.profile);
  const { data } = useBalance(wallet.data);

  return (
    <Card variant={"ghost"} className='flex-1'>
      <VStack className='items-center my-auto' space={"sm"}>
        <Badge className='w-max'>
          <BadgeText>{props.profile.name}</BadgeText>
        </Badge>
        <AmountComponent amount={data?.available} size='5xl' />
      </VStack>
    </Card>
  );
}
