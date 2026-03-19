import { HStack } from "@/components/ui/hstack";
import { P, Small } from "@/components/ui/typography";
import { ListingAttributeValue } from "@/types/backend";
import { match } from "ts-pattern";

type Props = {
  attributeValue: ListingAttributeValue;
};

export function AttributeDisplay({ attributeValue }: Props) {
  const { attribute, value, valueBool, valueText, valueFloat, multiValues } = attributeValue;

  const displayValue = match(attribute.type)
    .with("boolean", () => (valueBool ? "Yes" : "No"))
    .with("select", () => value?.value ?? "-")
    .with("text", () => valueText ?? "-")
    .with("range", () => {
      if (valueFloat !== null && valueFloat !== undefined) {
        return valueFloat.toLocaleString();
      }
      return valueText ?? "-";
    })
    .with("date", () => {
      if (!valueText) return "-";
      return new Date(valueText).toLocaleDateString();
    })
    .with("multi_select", () => {
      if (!multiValues || multiValues.length === 0) return "-";
      return multiValues.map((v) => v.value).join(", ");
    })
    .otherwise(() => "-");

  return (
    <HStack className="justify-between items-center">
      <Small className="text-arkaic-muted">{attribute.name}</Small>
      <P>{displayValue}</P>
    </HStack>
  );
}
