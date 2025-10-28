import useBitcoinPrice from "@/hooks/use-bitcoin-price";
import useSettingsStore from "@/stores/settings";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

export function AmountComponent(props: { amount?: number; size?: string }) {
  const { symbol } = useSettingsStore();
  const { data: exchangeRate } = useBitcoinPrice(symbol);

  if (!props.amount)
    return (
      <HStack className='items-center' space={"sm"}>
        <Text size={props.size}>No amount</Text>
      </HStack>
    );

  const formattedAmount = Intl.NumberFormat("it", {
    maximumFractionDigits: 2,
  }).format(
    exchangeRate ? (exchangeRate.last / 100000000) * props.amount : props.amount
  );

  return (
    <HStack className='items-center' space={"sm"}>
      <Text size={props.size}>{formattedAmount}</Text>
      <Text className='text-primary-500 font-thin text-4xl'>
        {exchangeRate ? symbol : "SATS"}
      </Text>
    </HStack>
  );
}
