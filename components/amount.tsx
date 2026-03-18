import { cnBase } from "tailwind-variants";
import Sats from "./icons/sats";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

export function AmountComponent(props: {
  amount?: number;
  size?: string;
  className?: string;
}) {
  const iconSize =
    props.size === "6xl"
      ? 28
      : props.size === "4xl"
        ? 24
        : props.size === "2xl"
          ? 18
          : 16;

  return (
    <HStack className={cnBase("items-center", props.className)} space={"sm"}>
      <Text size={props.size}>
        {Intl.NumberFormat().format(props.amount || 0)}
      </Text>
      <Sats width={iconSize} height={iconSize} />
    </HStack>
  );
}
