import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { P, Small } from "@/components/ui/typography";

type SeedPhraseGridProps = {
  words: string[];
  editable?: boolean;
  onWordChange?: (index: number, value: string) => void;
};

export default function SeedPhraseGrid({
  words,
  editable = false,
  onWordChange,
}: SeedPhraseGridProps) {
  const half = Math.ceil(words.length / 2);
  const leftColumn = words.slice(0, half);
  const rightColumn = words.slice(half);

  return (
    <HStack space='sm' className='w-full'>
      <VStack space='sm' className='flex-1'>
        {leftColumn.map((word, i) =>
          editable ? (
            <EditableCell
              key={i}
              index={i}
              number={i + 1}
              value={word}
              onWordChange={onWordChange}
            />
          ) : (
            <DisplayCell key={i} number={i + 1} word={word} />
          ),
        )}
      </VStack>
      <VStack space='sm' className='flex-1'>
        {rightColumn.map((word, i) =>
          editable ? (
            <EditableCell
              key={half + i}
              index={half + i}
              number={half + i + 1}
              value={word}
              onWordChange={onWordChange}
            />
          ) : (
            <DisplayCell key={half + i} number={half + i + 1} word={word} />
          ),
        )}
      </VStack>
    </HStack>
  );
}

function DisplayCell({ number, word }: { number: number; word: string }) {
  return (
    <HStack space='xs' className='items-center rounded-md border border-outline-200 bg-background-50 px-3 py-2.5'>
      <Small className='text-typography-400'>{number}.</Small>
      <P className='text-sm'>{word}</P>
    </HStack>
  );
}

function EditableCell({
  index,
  number,
  value,
  onWordChange,
}: {
  index: number;
  number: number;
  value: string;
  onWordChange?: (index: number, value: string) => void;
}) {
  return (
    <HStack space='xs' className='items-center'>
      <Small className='text-typography-400 w-7'>{number}.</Small>
      <Input size='sm' className='flex-1'>
        <InputField
          value={value}
          onChangeText={(val: string) => onWordChange?.(index, val)}
          autoCapitalize='none'
          autoCorrect={false}
        />
      </Input>
    </HStack>
  );
}
