import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

export function AmountComponent(props: { amount?: number; size?: string }) {
  const formattedAmount = Intl.NumberFormat("en", {})
    .format(props.amount || 0)
    .replaceAll(",", ".");
  return (
    <HStack className='items-baseline' space={"sm"}>
      <Text size={props.size}>{formattedAmount}</Text>
      <Text>sats</Text>
    </HStack>
  );
}
