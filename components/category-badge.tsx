import { Badge, BadgeText } from "@/components/ui/badge";
import { Category } from "@/types/backend";

type Props = {
  category: Category;
};

export function CategoryBadge({ category }: Props) {
  return (
    <Badge size='sm' variant='outline' action={"accent"}>
      <BadgeText>{category.name}</BadgeText>
    </Badge>
  );
}
