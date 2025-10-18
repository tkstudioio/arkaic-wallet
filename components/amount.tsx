import { chunk, first, join, map, split, toString } from "lodash";
import { match } from "ts-pattern";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

export function AmountComponent(props: { amount?: number; size?: string }) {
  return (
    <HStack className='items-baseline'>
      <HStack>
        {match(props.amount)
          .with(0, undefined, () => (
            <>
              <Text size={props.size} className='color-background-200'>
                000.000.00
              </Text>
              <Text size={props.size}>0</Text>
            </>
          ))
          .otherwise((amount) => {
            const prefix = getPrefix(amount);
            const formattedAmount = Intl.NumberFormat("en", {})
              .format(amount)
              .replaceAll(",", ".");
            return (
              <>
                <Text size={props.size} className='color-background-200'>
                  {prefix}
                </Text>
                <Text size={props.size}>{formattedAmount}</Text>
              </>
            );
          })}
      </HStack>
      <Text>sats</Text>
    </HStack>
  );
}

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
