import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { toLower, toUpper } from "lodash";

type SeedPhraseGridProps = {
  words: string[];
  isDisabled?: boolean;
  onWordChange?: (index: number, value: string) => void;
};

export default function SeedPhraseGrid({
  words,
  isDisabled = false,
  onWordChange,
}: SeedPhraseGridProps) {
  const half = Math.ceil(words.length / 2);
  const leftColumn = words.slice(0, half);
  const rightColumn = words.slice(half);

  return (
    <HStack space='lg' className='w-full'>
      <VStack space='md' className='flex-1'>
        {leftColumn.map((word, i) => (
          <EditableCell
            key={i}
            index={i}
            number={i + 1}
            value={word}
            onWordChange={onWordChange}
            isDisabled={isDisabled}
          />
        ))}
      </VStack>
      <VStack space='md' className='flex-1'>
        {rightColumn.map((word, i) => (
          <EditableCell
            key={half + i}
            index={half + i}
            number={half + i + 1}
            value={word}
            onWordChange={onWordChange}
            isDisabled={isDisabled}
          />
        ))}
      </VStack>
    </HStack>
  );
}

function EditableCell({
  index,
  number,
  value,
  onWordChange,
  isDisabled,
}: {
  index: number;
  number: number;
  value: string;
  onWordChange?: (index: number, value: string) => void;
  isDisabled?: boolean;
}) {
  return (
    <HStack className='items-center'>
      <Small className='text-typography-400 w-7'>{number}</Small>
      <Input size='lg' className='flex-1' isDisabled={isDisabled}>
        <InputField
          value={toUpper(value)}
          onChangeText={(val: string) => onWordChange?.(index, toLower(val))}
          autoCapitalize='none'
          autoCorrect={false}
        />
      </Input>
    </HStack>
  );
}
