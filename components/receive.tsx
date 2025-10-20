import { useRouter } from "expo-router";
import { useState } from "react";
import { AmountComponent } from "./amount";
import PosComponent from "./pos";
import QRActionSheet from "./qr-action-sheet";
import { Button, ButtonText } from "./ui/button";
import { Divider } from "./ui/divider";
import { VStack } from "./ui/vstack";

export function ReceiveComponent() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | undefined>(undefined);

  return (
    <VStack space={"4xl"}>
      <VStack space={"md"} className='items-end'>
        <AmountComponent amount={amount} size='6xl' />

        <PosComponent value={amount || 0} onChange={setAmount} />
      </VStack>
      <Divider />
      <VStack space={"md"}>
        <QRActionSheet amount={amount} />
        <Button variant={"link"} action='negative' onPress={router.back}>
          <ButtonText>Cancel</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
