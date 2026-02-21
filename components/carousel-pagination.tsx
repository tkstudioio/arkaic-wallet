import { map, range } from "lodash";
import { View } from "react-native";

import { cnBase } from "tailwind-variants";
import { HStack } from "./ui/hstack";

export function CarouselPagination(props: {
  totalSlides: number;
  selectedIndex: number;
}) {
  return (
    <HStack className='justify-center' space={"xs"}>
      {map(range(props.totalSlides), (index) => (
        <View
          key={index}
          className={cnBase(
            "size-3 rounded-arkaic-button",
            index === props.selectedIndex
              ? "bg-arkaic-primary"
              : "bg-arkaic-primary/30",
          )}
        ></View>
      ))}
    </HStack>
  );
}
