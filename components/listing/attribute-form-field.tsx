import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CategoryAttribute } from "@/types/backend";
import { match } from "ts-pattern";
import { View } from "react-native";

type AttributeFormFieldProps = {
  attr: CategoryAttribute;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
};

export function AttributeFormField({
  attr,
  value,
  onChange,
}: AttributeFormFieldProps) {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText>
          {attr.name}
          {attr.required && (
            <FormControlLabelText className="text-arkaic-negative">
              {" "}
              (required)
            </FormControlLabelText>
          )}
        </FormControlLabelText>
      </FormControlLabel>

      {match(attr.type)
        .with("select", () => (
          <Select
            selectedValue={typeof value === "string" ? value : undefined}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger>
              <SelectInput placeholder="Select a value…" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectScrollView>
                  {attr.values.map((option) => (
                    <SelectItem
                      key={option.id}
                      label={option.value}
                      value={String(option.id)}
                    />
                  ))}
                </SelectScrollView>
              </SelectContent>
            </SelectPortal>
          </Select>
        ))
        .with("boolean", () => (
          <View className="flex-row items-center w-max">
            <Switch
              value={typeof value === "boolean" ? value : false}
              onValueChange={(v) => onChange(v)}
            />
          </View>
        ))
        .otherwise(() => null)}
    </FormControl>
  );
}
