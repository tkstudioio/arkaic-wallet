import useBitcoinPrice from "@/hooks/use-bitcoin-price";
import useSettingsStore from "@/stores/settings";
import { useRouter } from "expo-router";
import { useState } from "react";
import PosComponent from "./pos";
import QRActionSheet from "./qr-action-sheet";
import { Button, ButtonText } from "./ui/button";
import { Divider } from "./ui/divider";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function ReceiveComponent() {
  const router = useRouter();
  const [amountInFiat, setAmountInFiat] = useState<number | undefined>(
    undefined
  );
  const { symbol } = useSettingsStore();
  const { data: exchangeRate } = useBitcoinPrice(symbol);

  return (
    <VStack space={"4xl"}>
      <VStack space={"md"} className='items-end'>
        <HStack className='items-center' space={"sm"}>
          <Text size='6xl'>
            {Intl.NumberFormat("it", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(amountInFiat ? amountInFiat / 100 : 0)}
          </Text>
          <Text className='text-primary-500 font-thin text-4xl'>
            {exchangeRate ? symbol : "SATS"}
          </Text>
        </HStack>
        <PosComponent value={amountInFiat || 0} onChange={setAmountInFiat} />
      </VStack>
      <Divider />
      <VStack space={"md"}>
        <QRActionSheet
          amount={
            exchangeRate?.last
              ? amountInFiat
                ? ((amountInFiat / 100) * 100000000) / exchangeRate.last
                : 0
              : 0
          }
        />
        <Button variant={"link"} action='negative' onPress={router.back}>
          <ButtonText>Cancel</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
