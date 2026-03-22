import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { ChevronDownIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
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
import { Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { CategoryAttribute } from "@/types/backend";
import { map } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { match } from "ts-pattern";
import { Button, ButtonText } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export type AttributeFormValues = Record<string, string | boolean | number[]>;

type AttributeFieldProps = {
  attr: CategoryAttribute;
  control: ReturnType<typeof useForm<AttributeFormValues>>["control"];
};

export function AttributeField({ attr, control }: AttributeFieldProps) {
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
          <Controller
            control={control}
            name={String(attr.attributeId)}
            defaultValue=""
            render={({ field: { value, onChange } }) => (
              <Select selectedValue={value as string} onValueChange={onChange}>
                <SelectTrigger className="w-max">
                  <SelectInput placeholder="Select a value…" />
                  <SelectIcon as={ChevronDownIcon} className="mr-3" />
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
        .with("boolean", () => (
          <Controller
            control={control}
            name={String(attr.attributeId)}
            defaultValue={false}
            render={({ field: { value, onChange } }) => (
              <View className="flex-row items-center w-max">
                <Switch
                  value={typeof value === "boolean" ? value : false}
                  onValueChange={onChange}
                />
              </View>
            )}
          />
        ))
        .with("text", () => (
          <Controller
            control={control}
            name={String(attr.attributeId)}
            defaultValue=""
            render={({ field: { value, onChange } }) => (
              <Input>
                <InputField
                  placeholder="Enter value..."
                  value={typeof value === "string" ? value : ""}
                  onChangeText={onChange}
                />
              </Input>
            )}
          />
        ))
        .with("range", () => (
          <Controller
            control={control}
            name={String(attr.attributeId)}
            defaultValue=""
            render={({ field: { value, onChange } }) => {
              const parts =
                typeof value === "string" ? value.split(",") : ["", ""];
              const minVal = parts[0] ?? "";
              const maxVal = parts[1] ?? "";
              return (
                <VStack space="xs">
                  <HStack space="sm" className="items-center">
                    <VStack space="xs" className="flex-1">
                      <Small className="text-arkaic-muted">Min</Small>
                      <Input>
                        <InputField
                          placeholder={String(attr.rangeMin ?? 0)}
                          value={minVal}
                          onChangeText={(v) => onChange(`${v},${maxVal}`)}
                          keyboardType="numeric"
                        />
                      </Input>
                    </VStack>
                    <VStack space="xs" className="flex-1">
                      <Small className="text-arkaic-muted">Max</Small>
                      <Input>
                        <InputField
                          placeholder={String(attr.rangeMax ?? "")}
                          value={maxVal}
                          onChangeText={(v) => onChange(`${minVal},${v}`)}
                          keyboardType="numeric"
                        />
                      </Input>
                    </VStack>
                  </HStack>
                  {attr.rangeUnit ? (
                    <Small className="text-arkaic-muted">
                      {attr.rangeUnit}
                    </Small>
                  ) : null}
                </VStack>
              );
            }}
          />
        ))
        .with("date", () => (
          <Controller
            control={control}
            name={String(attr.attributeId)}
            defaultValue=""
            render={({ field: { value, onChange } }) => (
              <Input>
                <InputField
                  placeholder="YYYY-MM-DD"
                  value={typeof value === "string" ? value : ""}
                  onChangeText={onChange}
                />
              </Input>
            )}
          />
        ))
        .with("multi_select", () => (
          <Controller
            control={control}
            name={String(attr.attributeId)}
            defaultValue={[]}
            render={({ field: { value, onChange } }) => {
              const selectedIds = Array.isArray(value) ? value : [];
              return (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {attr.values.map((option) => {
                    const isSelected = selectedIds.includes(option.id);
                    return (
                      <Button
                        key={option.id}
                        variant="outline"
                        action={isSelected ? "primary" : "neutral"}
                        className="w-max"
                        onPress={() => {
                          const next = isSelected
                            ? selectedIds.filter(
                                (id: number) => id !== option.id,
                              )
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
            }}
          />
        ))
        .otherwise(() => null)}
    </FormControl>
  );
}
