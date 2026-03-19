import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategory } from "@/hooks/categories/use-category";
import { useCategoryAttributes } from "@/hooks/categories/use-category-attributes";
import { CategoryAttribute } from "@/types/backend";
import { Link, useLocalSearchParams } from "expo-router";
import { filter, map } from "lodash";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { match } from "ts-pattern";

type AttributeFormValues = Record<string, string | boolean>;

type AttributeFieldProps = {
  attr: CategoryAttribute;
  control: ReturnType<typeof useForm<AttributeFormValues>>["control"];
};

/** Full-form field used inside the action sheet */
function AttributeField({ attr, control }: AttributeFieldProps) {
  return (
    <FormControl>
      <FormControlLabel>
        <FormControlLabelText>
          {attr.name}
          {attr.required && (
            <FormControlLabelText className='text-arkaic-negative'>
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
            defaultValue=''
            render={({ field: { value, onChange } }) => (
              <Select selectedValue={value as string} onValueChange={onChange}>
                <SelectTrigger className='w-max'>
                  <SelectInput placeholder='Select a value…' />
                  <SelectIcon as={ChevronDownIcon} className='mr-3' />
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
              <View className='flex-row items-center w-max'>
                <Switch
                  value={typeof value === "boolean" ? value : false}
                  onValueChange={onChange}
                />
              </View>
            )}
          />
        ))
        .otherwise(() => null)}
    </FormControl>
  );
}

/** Compact chip used in the horizontal filter row */
function AttributeChip({ attr, control }: AttributeFieldProps) {
  return match(attr.type)
    .with("select", () => (
      <Controller
        control={control}
        name={String(attr.attributeId)}
        defaultValue=''
        render={({ field: { value, onChange } }) => (
          <Select selectedValue={value as string} onValueChange={onChange}>
            <SelectTrigger>
              <SelectInput placeholder={attr.name} className='text-sm' />
              <SelectIcon as={ChevronDownIcon} className='mr-1' />
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
          <HStack space={"md"} className='items-center'>
            <Small>{attr.name}</Small>
            <Switch
              value={typeof value === "boolean" ? value : false}
              onValueChange={onChange}
            />
          </HStack>
        )}
      />
    ))
    .otherwise(() => null);
}

export default function CategoryDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const categoryQuery = useCategory(slug);
  const attributesQuery = useCategoryAttributes(categoryQuery.data?.id);
  const { control, handleSubmit } = useForm<AttributeFormValues>();
  const [showFilters, setShowFilters] = useState(false);

  const onSubmit = (values: AttributeFormValues) => {
    console.log("Category attribute form values:", values);
    setShowFilters(false);
  };

  const attributes = attributesQuery.data;
  const hasAttributes = attributes && attributes.length > 0;

  return (
    <VStack space='md'>
      {match(categoryQuery)
        .with({ isLoading: true }, () => (
          <View className='px-4'>
            <Spinner />
          </View>
        ))
        .with({ isError: true }, () => (
          <View className='px-4'>
            <Small className='text-arkaic-negative'>
              Failed to load category.
            </Small>
          </View>
        ))
        .otherwise(({ data: category }) => (
          <>
            {/* Breadcrumb */}
            <View className='flex-row items-center flex-wrap gap-1'>
              <Link href='/categories'>
                <Large className='text-typography-500'>All products</Large>
              </Link>
              {category?.parent && (
                <>
                  <Large className='text-typography-500'>{" › "}</Large>
                  <Link href={`/categories/${category.parent.slug}`}>
                    <Large className='text-typography-500'>
                      {category.parent.name}
                    </Large>
                  </Link>
                </>
              )}
              <Large className='text-typography-500'>{" › "}</Large>
              <Large>{category?.name}</Large>
            </View>

            {/* Subcategories — horizontal scroll */}
            {category?.children && category.children.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName='flex-row gap-2 '
              >
                {map(category.children, (child) => (
                  <Link
                    key={child.slug}
                    href={`/categories/${child.slug}`}
                    asChild
                  >
                    <Button
                      variant='outline'
                      action={"neutral"}
                      size='sm'
                      className='w-max'
                    >
                      <ButtonText>{child.name}</ButtonText>
                    </Button>
                  </Link>
                ))}
              </ScrollView>
            )}

            {/* Attribute chips — horizontal scroll */}
            {match(attributesQuery)
              .with({ isLoading: true }, () => <Spinner size='small' />)
              .with({ isError: true }, () => null)
              .otherwise(() =>
                hasAttributes ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName='flex-row gap-2 '
                  >
                    {map(
                      filter(attributes, ({ type }) => type !== "boolean"),
                      (attr) => (
                        <AttributeChip
                          key={attr.attributeId}
                          attr={attr}
                          control={control}
                        />
                      ),
                    )}
                  </ScrollView>
                ) : null,
              )}

            {/* Filters action sheet */}
            <Actionsheet
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
            >
              <ActionsheetBackdrop />
              <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                  <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <ActionsheetScrollView className='w-full'>
                  <VStack space='md' className='p-4 pb-8'>
                    <P className='font-bold'>Filters</P>
                    {map(attributes, (attr) => (
                      <AttributeField
                        key={attr.attributeId}
                        attr={attr}
                        control={control}
                      />
                    ))}
                    <Button onPress={handleSubmit(onSubmit)}>
                      <ButtonText>Apply</ButtonText>
                    </Button>
                  </VStack>
                </ActionsheetScrollView>
              </ActionsheetContent>
            </Actionsheet>
          </>
        ))}
    </VStack>
  );
}
