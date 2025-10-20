import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { isNaN, map, range, toNumber, toString } from "lodash";
import { Delete } from "lucide-react-native";
import { useEffect, useState } from "react";

export type PosComponentProps = {
  onChange: (digit: number | undefined) => void;
  value: number;
};

export default function PosComponent(props: PosComponentProps) {
  const columns: number[] = [1, 2, 3];
  const rows: number[] = range(3);

  const [, setValue] = useState<number>(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  function onChange(digit: number): void {
    setValue((value) => {
      const newValue: number = toNumber(`${value}${digit}`);
      if (isNaN(newValue)) {
        props.onChange(0);
        return 0;
      }
      props.onChange(newValue);
      return newValue;
    });
  }

  function handleClear() {
    setValue(0);
    props.onChange(undefined);
  }

  function handleBackspace() {
    const newValue = toNumber(toString(props.value).slice(0, -1));
    console.log(props.value, newValue);
    if (isNaN(newValue)) return;
    setValue(newValue);
    props.onChange(newValue);
  }

  return (
    <VStack space={"md"}>
      {map(rows, (column) => (
        <HStack space={"md"} key={column}>
          {map(columns, (row) => {
            const digit = row + 3 * column;
            return (
              <Button
                key={row}
                action='secondary'
                className='flex-1 aspect-video'
                onPress={() => onChange(digit)}
              >
                <ButtonText>{digit}</ButtonText>
              </Button>
            );
          })}
        </HStack>
      ))}
      <HStack space={"md"}>
        <Button
          className='w-max flex-1 aspect-video px-5'
          action={"negative"}
          variant={"link"}
          onPress={handleClear}
        >
          <ButtonText>C</ButtonText>
        </Button>
        <Button
          action='secondary'
          className='w-max flex-1 aspect-video  px-5'
          onPress={() => onChange(0)}
        >
          <ButtonText>{0}</ButtonText>
        </Button>
        <Button
          className='w-max flex-1 aspect-video  px-5'
          action='secondary'
          onPress={handleBackspace}
        >
          <ButtonIcon as={Delete} />
        </Button>
      </HStack>
    </VStack>
  );
}
