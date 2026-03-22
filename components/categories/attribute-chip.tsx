import { AttributeFormValues } from "@/components/categories/attribute-field";
import { ChevronDownIcon } from "@/components/ui/icon";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { CategoryAttribute } from "@/types/backend";
import { map } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { match } from "ts-pattern";

type AttributeChipProps = {
  attr: CategoryAttribute;
  control: ReturnType<typeof useForm<AttributeFormValues>>["control"];
};

export function AttributeChip({ attr, control }: AttributeChipProps) {
  return match(attr.type)
    .with("select", () => (
      <Controller
        control={control}
        name={String(attr.attributeId)}
        defaultValue=""
        render={({ field: { value, onChange } }) => (
          <Select selectedValue={value as string} onValueChange={onChange}>
            <SelectTrigger>
              <SelectInput placeholder={attr.name} className="text-sm" />
              <SelectIcon as={ChevronDownIcon} className="mr-1" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {map(attr.values, (option) => (
                  <SelectItem
                    key={option.id}
                    label={option.value}
                    value={option.value}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        )}
      />
    ))
    .with("multi_select", () => (
      <Controller
        control={control}
        name={String(attr.attributeId)}
        defaultValue=""
        render={({ field: { value, onChange } }) => (
          <Select selectedValue={value as string} onValueChange={onChange}>
            <SelectTrigger>
              <SelectInput placeholder={attr.name} className="text-sm" />
              <SelectIcon as={ChevronDownIcon} className="mr-1" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {map(attr.values, (option) => (
                  <SelectItem
                    key={option.id}
                    label={option.value}
                    value={option.value}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        )}
      />
    ))
    .otherwise(() => null);
}
