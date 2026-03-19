import { AttributeFormField } from "@/components/listing/attribute-form-field";
import { CategoryPicker } from "@/components/category-picker";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Large, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategoryAttributes } from "@/hooks/categories/use-category-attributes";
import { useCreateProduct } from "@/hooks/listings/use-create-listing";
import { ListingAttributeValue } from "@/types/backend";

import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { toNumber, toString } from "lodash";
import { ArrowLeft, Camera } from "lucide-react-native";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";

type FormValues = {
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
  attributes: Record<string, string | boolean>;
};

function ProductCreateForm() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: null,
      attributes: {},
    },
    onSubmit: (values) => {
      const attributeValues: ListingAttributeValue[] = [];

      if (attributesQuery.data) {
        for (const attr of attributesQuery.data) {
          const rawValue = values.attributes[String(attr.attributeId)];
          if (rawValue === undefined || rawValue === "") continue;

          if (attr.type === "select") {
            attributeValues.push({
              attributeId: attr.attributeId,
              valueId: Number(rawValue),
            });
          } else if (attr.type === "boolean") {
            attributeValues.push({
              attributeId: attr.attributeId,
              valueBool: rawValue as boolean,
            });
          }
        }
      }

      createProduct.mutate({
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: values.categoryId!,
        attributes: attributeValues,
      });
    },
  });

  const { values, setFieldValue, handleChange, handleSubmit } = formik;

  const attributesQuery = useCategoryAttributes(
    values.categoryId ?? undefined,
  );

  const hasAllRequiredAttributes = (attributesQuery.data ?? [])
    .filter((a) => a.required)
    .every((a) => {
      const val = values.attributes[String(a.attributeId)];
      return val !== undefined && val !== "";
    });

  const canSubmit =
    !!values.categoryId &&
    !!values.name &&
    values.price > 0 &&
    values.description.length >= 12 &&
    hasAllRequiredAttributes &&
    !createProduct.isPending;

  return (
    <VStack className="flex-1 h-full">
      <VStack space={"md"}>
        <HStack className="items-center" space="md">
          <Button
            action="neutral"
            variant="link"
            onPress={router.back}
            className="w-max"
          >
            <ButtonIcon as={ArrowLeft} />
          </Button>
          <Small className="font-semibold">Go back</Small>
        </HStack>
        <Divider />
      </VStack>

      <ScrollView className="flex-1 py-arkaic-md">
        {/* Section 1: Product photos */}
        <VStack space="md" className="pb-6">
          <Large className="font-semibold">Photos</Large>
          <Button
            action={"neutral"}
            variant={"outline"}
            className="w-max aspect-video"
          >
            <ButtonIcon as={Camera} />
            <ButtonText>Add photo</ButtonText>
          </Button>
        </VStack>

        <Divider />

        {/* Section 2: General info */}
        <VStack space="lg" className="py-6">
          <Large className="font-semibold">General info</Large>
          <VStack space="xs">
            <Small>Name</Small>
            <Input>
              <InputField
                placeholder="Product name"
                value={values.name}
                onChangeText={handleChange("name")}
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <Small>Description</Small>
            <Input className="h-24">
              <InputField
                multiline
                textAlignVertical="top"
                className="py-2"
                placeholder="Product description (min. 12 characters)"
                value={values.description}
                onChangeText={handleChange("description")}
              />
            </Input>
            {values.description.length > 0 && values.description.length < 12 && (
              <Small className="text-arkaic-negative">
                Minimum 12 characters ({values.description.length}/12)
              </Small>
            )}
          </VStack>

          <VStack space="xs">
            <Small>Price (sats)</Small>
            <Input>
              <InputField
                placeholder="0"
                value={toString(values.price)}
                onChangeText={(value) =>
                  setFieldValue("price", toNumber(value))
                }
                keyboardType="numeric"
              />
            </Input>
          </VStack>
        </VStack>

        <Divider />

        {/* Section 3: Product details (category + attributes) */}
        <VStack space="lg" className="pt-6">
          <Large className="font-semibold">Product details</Large>

          <CategoryPicker
            onSelect={(categoryId) => {
              setFieldValue("categoryId", categoryId);
              setFieldValue("attributes", {});
            }}
            selectedCategoryId={values.categoryId}
          />

          {values.categoryId &&
            match(attributesQuery)
              .with({ isLoading: true }, () => <Spinner />)
              .with({ isError: true }, () => (
                <Small className="text-arkaic-negative">
                  Failed to load attributes.
                </Small>
              ))
              .otherwise(({ data: attrs }) => (
                <VStack space="md">
                  {(attrs ?? []).map((attr) => (
                    <AttributeFormField
                      key={attr.attributeId}
                      attr={attr}
                      value={values.attributes[String(attr.attributeId)]}
                      onChange={(val) =>
                        setFieldValue(`attributes.${attr.attributeId}`, val)
                      }
                    />
                  ))}
                </VStack>
              ))}
        </VStack>
      </ScrollView>

      <VStack className="py-4">
        <Button onPress={() => handleSubmit()} isDisabled={!canSubmit}>
          <ButtonText>
            {createProduct.isPending ? "Creating..." : "Create"}
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}

export default function ProductCreate() {
  return <ProductCreateForm />;
}
