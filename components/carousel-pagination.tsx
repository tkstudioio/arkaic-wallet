import { map, range } from "lodash";
import { Badge } from "./ui/badge";
import { HStack } from "./ui/hstack";

export function CarouselPagination(props: {
  totalSlides: number;
  selectedIndex: number;
}) {
  return (
    <HStack className='justify-center' space={"xs"}>
      {map(range(props.totalSlides), (index) => (
        <Badge
          key={index}
          className='rounded-full size-2! w-1 h-1 p-0! aspect-square'
          variant={"outline"}
          action={index === props.selectedIndex ? "info" : "muted"}
        />
      ))}
    </HStack>
  );
}
