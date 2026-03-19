import { HStack } from "@/components/ui/hstack";
import { P, Small } from "@/components/ui/typography";
import { ListingAttributeValue } from "@/types/backend";

type Props = {
  attributeValue: ListingAttributeValue;
};

export function AttributeDisplay({ attributeValue }: Props) {
  const { attribute, value, valueBool } = attributeValue;

  let displayValue: string;
  if (attribute.type === "boolean") {
    displayValue = valueBool ? "Yes" : "No";
  } else {
    displayValue = value?.value ?? "—";
  }

  return (
    <HStack className="justify-between items-center">
      <Small className="text-arkaic-muted">{attribute.name}</Small>
      <P>{displayValue}</P>
    </HStack>
  );
}
