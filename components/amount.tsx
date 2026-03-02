import Sats from "./icons/sats";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

export function AmountComponent(props: { amount?: number; size?: string }) {
  const iconSize =
    props.size === "6xl"
      ? 28
      : props.size === "4xl"
        ? 24
        : props.size === "2xl"
          ? 18
          : 16;

  if (!props.amount)
    return (
      <HStack className='items-center' space={"sm"}>
        <Text size={props.size}>No funds</Text>
      </HStack>
    );

  return (
    <HStack className='items-center justify-center' space={"sm"}>
      <Text size={props.size}>{Intl.NumberFormat().format(props.amount)}</Text>
      <Sats width={iconSize} height={iconSize} />
    </HStack>
  );
}
