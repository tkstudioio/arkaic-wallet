import QRActionSheet from "@/components/qr-action-sheet";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { map, range, toNumber } from "lodash";
import { useEffect, useState } from "react";
import { View } from "react-native";

export type PosComponentProps = {
  onChange: (digit: number | undefined) => void;
  value: number;
};

export default function PosComponent(props: PosComponentProps) {
  const columns: number[] = [1, 2, 3];
  const rows: number[] = range(3);

  const [value, setValue] = useState<number>(props.value);

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

  return (
    <VStack space={"md"}>
      {map(rows, (column) => (
        <HStack space={"md"} key={column}>
          {map(columns, (row) => {
            const digit = row + 3 * column;
            return (
              <Button
                key={row}
                className='flex-1 aspect-video'
                onPress={() => onChange(digit)}
              >
                <ButtonText>{digit}</ButtonText>
              </Button>
            );
          })}
        </HStack>
      ))}
      <View className='flex-row gap-0.5'>
        <Button className='flex-1 h-20' onPress={() => onChange(0)}>
          <ButtonText>{0}</ButtonText>
        </Button>
      </View>
      <View className='flex-row gap-2'>
        <Button
          action={"negative"}
          className=' aspect-square h-24'
          onPress={handleClear}
        >
          <ButtonText>C</ButtonText>
        </Button>
        <QRActionSheet amount={value} />
      </View>
    </VStack>
  );
}
