import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
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
import { Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { CategoryAttribute } from "@/types/backend";
import { match } from "ts-pattern";
import { View } from "react-native";

type AttributeFormFieldProps = {
  attr: CategoryAttribute;
  value: string | boolean | number[] | undefined;
  onChange: (value: string | boolean | number[]) => void;
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
        .with("text", () => (
          <Input>
            <InputField
              placeholder="Enter value..."
              value={typeof value === "string" ? value : ""}
              onChangeText={(v) => onChange(v)}
            />
          </Input>
        ))
        .with("range", () => (
          <VStack space="xs">
            <HStack space="sm" className="items-center">
              <Input className="flex-1">
                <InputField
                  placeholder={`${attr.rangeMin ?? 0} - ${attr.rangeMax ?? ""}`}
                  value={typeof value === "string" ? value : ""}
                  onChangeText={(v) => onChange(v)}
                  keyboardType="numeric"
                />
              </Input>
              {attr.rangeUnit ? <Small className="text-arkaic-muted">{attr.rangeUnit}</Small> : null}
            </HStack>
            {attr.rangeMin !== undefined && attr.rangeMax !== undefined ? (
              <Small className="text-arkaic-muted">
                Min: {attr.rangeMin.toLocaleString()} - Max: {attr.rangeMax.toLocaleString()}
              </Small>
            ) : null}
          </VStack>
        ))
        .with("date", () => (
          <Input>
            <InputField
              placeholder="YYYY-MM-DD"
              value={typeof value === "string" ? value : ""}
              onChangeText={(v) => onChange(v)}
            />
          </Input>
        ))
        .with("multi_select", () => {
          const selectedIds = Array.isArray(value) ? value : [];
          return (
            <View className="flex-row flex-wrap gap-2">
              {attr.values.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <Button
                    key={option.id}
                    size="sm"
                    variant={isSelected ? "solid" : "outline"}
                    action={isSelected ? "primary" : "neutral"}
                    onPress={() => {
                      const next = isSelected
                        ? selectedIds.filter((id) => id !== option.id)
                        : [...selectedIds, option.id];
                      onChange(next);
                    }}
                  >
                    <ButtonText>{option.value}</ButtonText>
                  </Button>
                );
              })}
            </View>
          );
        })
        .otherwise(() => null)}
    </FormControl>
  );
}
