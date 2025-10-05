import { useState } from "react";
import PosComponent from "./pos";
import { Card } from "./ui/card";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function ReceiveComponent() {
  const [amount, setAmount] = useState<number | undefined>(undefined);

  return (
    <Card size='md' variant='ghost' className='gap-6'>
      <VStack>
        <Heading size='xl'>Insert amount</Heading>
        <Text>Or leave empty</Text>
      </VStack>

      <HStack className='items-baseline' space={"sm"}>
        <Heading size={"5xl"}>
          {Intl.NumberFormat("it-IT").format(amount || 0)}
        </Heading>
        <Text>SATS</Text>
      </HStack>

      <PosComponent value={amount || 0} onChange={setAmount} />
    </Card>
  );
}
