import { ExchangeRate } from "@/hooks/use-bitcoin-price";

import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

export function AmountComponent(props: {
  amount?: number;
  size?: string;
  exchangeRate?: ExchangeRate;
}) {
  if (!props.amount)
    return (
      <HStack className='items-center' space={"sm"}>
        <Text size={props.size}>No funds</Text>
      </HStack>
    );

  return (
    <HStack className='items-center' space={"sm"}>
      <Text size={props.size}>{Intl.NumberFormat().format(props.amount)}</Text>
    </HStack>
  );
}
