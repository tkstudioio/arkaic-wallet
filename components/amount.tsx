import { chunk, first, join, map, split, toString } from "lodash";
import { match } from "ts-pattern";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

function getPrefix(amount: number): string {
  const stringAmount = toString(amount);
  const paddedAmount = stringAmount.padStart(9, "0");
  const fullAmount = join(
    map(chunk(paddedAmount, 3), (c) => join(c, "")),
    "."
  );
  const [prefix] = split(fullAmount, first(stringAmount));
  return prefix;
}

export function AmountComponent(props: { amount: number; size?: string }) {
  const prefix = getPrefix(props.amount);
  const formattedAmount = Intl.NumberFormat("en", {})
    .format(props.amount)
    .replaceAll(",", ".");

  return (
    <HStack className='items-center' space={"xs"}>
      <HStack>
        {match(props.amount)
          .with(0, () => (
            <>
              <Heading size={props.size} className='color-background-400'>
                000.000.00
              </Heading>
              <Heading size={props.size}>0</Heading>
            </>
          ))
          .otherwise(() => (
            <>
              <Heading size={props.size} className='color-background-400'>
                {prefix}
              </Heading>
              <Heading size={props.size}>{formattedAmount}</Heading>
            </>
          ))}
      </HStack>
      <Text size={props.size}>sats</Text>
    </HStack>
  );
}
