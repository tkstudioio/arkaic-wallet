import { AttributeFormField } from "@/components/listing/attribute-form-field";
import { CategoryPicker } from "@/components/category-picker";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Large, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategoryAttributes } from "@/hooks/categories/use-category-attributes";
import { useCreateProduct } from "@/hooks/listings/use-create-listing";
import { CreateListingAttribute } from "@/types/backend";

import { useRouter } from "expo-router";
import { useFormik } from "formik";
import { toNumber, toString } from "lodash";
import { ArrowLeft, Camera, X } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { match } from "ts-pattern";
import { Divider } from "@/components/ui/divider";

const MAX_PHOTOS = 10;
const SLOT_SIZE = 80;

type DraggablePhotoSlotProps = {
  photoId: string | undefined;
  index: number;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

function DraggablePhotoSlot({ photoId, index, onRemove, onReorder }: DraggablePhotoSlotProps) {
  const translateX = useSharedValue(0);
  const isActive = useSharedValue(false);
  const zIndex = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(!!photoId)
    .activateAfterLongPress(300)
    .runOnJS(true)
    .onStart(() => {
      isActive.value = true;
      zIndex.value = 100;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const slotsMoved = Math.round(event.translationX / (SLOT_SIZE + 8));
      const newIndex = Math.max(0, Math.min(index + slotsMoved, MAX_PHOTOS - 2));

      if (newIndex !== index && photoId) {
        onReorder(index, newIndex);
      }

      translateX.value = withSpring(0);
      isActive.value = false;
      zIndex.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    zIndex: zIndex.value,
    opacity: isActive.value ? 0.8 : 1,
  }));

  if (!photoId) {
    return (
      <Skeleton
        isLoaded={false}
        style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
        className="rounded-arkaic-button"
      />
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[{ width: SLOT_SIZE, height: SLOT_SIZE }, animatedStyle]}
        className="rounded-arkaic-button bg-arkaic-border relative"
      >
        <View className="flex-1 items-center justify-center">
          <Small className="text-arkaic-foreground">{index + 1}</Small>
        </View>

        <Pressable
          onPress={() => onRemove(index)}
          className="absolute top-1 right-1 z-10 h-5 w-5 items-center justify-center rounded-full bg-arkaic-negative"
        >
          <X size={12} color="white" />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

type FormValues = {
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
  attributes: Record<string, string | boolean | number[]>;
};

function ProductCreateForm() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const [photos, setPhotos] = useState<string[]>([]);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: null,
      attributes: {},
    },
    onSubmit: (values) => {
      const attributeValues: CreateListingAttribute[] = [];

      if (attributesQuery.data) {
        for (const attr of attributesQuery.data) {
          const rawValue = values.attributes[String(attr.attributeId)];
          if (rawValue === undefined || rawValue === "") continue;

          match(attr.type)
            .with("select", () => {
              attributeValues.push({
                attributeId: attr.attributeId,
                valueId: Number(rawValue),
              });
            })
            .with("boolean", () => {
              attributeValues.push({
                attributeId: attr.attributeId,
                valueBool: rawValue as boolean,
              });
            })
            .with("text", () => {
              attributeValues.push({
                attributeId: attr.attributeId,
                valueText: rawValue as string,
              });
            })
            .with("range", () => {
              attributeValues.push({
                attributeId: attr.attributeId,
                valueText: String(rawValue),
              });
            })
            .with("date", () => {
              attributeValues.push({
                attributeId: attr.attributeId,
                valueText: rawValue as string,
              });
            })
            .with("multi_select", () => {
              const ids = rawValue as number[];
              if (ids.length > 0) {
                attributeValues.push({
                  attributeId: attr.attributeId,
                  valueIds: ids,
                });
              }
            })
            .otherwise(() => {});
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
      if (val === undefined || val === "") return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    });

  const canSubmit =
    !!values.categoryId &&
    !!values.name &&
    values.price > 0 &&
    values.description.length >= 12 &&
    hasAllRequiredAttributes &&
    !createProduct.isPending;

  function handleAddPhoto() {
    if (photos.length >= MAX_PHOTOS - 1) return;
    const newId = `photo_${Date.now()}`;
    setPhotos((prev) => [...prev, newId]);
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    setPhotos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      console.log('Photo order updated:', updated);
      return updated;
    });
  }

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

      <ScrollView className="flex-1 py-arkaic-md" contentContainerStyle={{ gap: 12 }}>
        <Card>
          <Large className="font-semibold">Photos</Large>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <Pressable
              onPress={handleAddPhoto}
              className="items-center justify-center rounded-arkaic-button border border-dashed border-arkaic-border bg-arkaic-background"
              style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
            >
              <Camera size={24} className="text-arkaic-muted" />
              <Small className="text-arkaic-muted">Add</Small>
            </Pressable>

            {Array.from({ length: MAX_PHOTOS - 1 }).map((_, index) => (
              <DraggablePhotoSlot
                key={photos[index] ?? `empty_${index}`}
                photoId={photos[index]}
                index={index}
                onRemove={handleRemovePhoto}
                onReorder={handleReorder}
              />
            ))}
          </ScrollView>
        </Card>

        <Card>
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
        </Card>

        <Card>
          <Large className="font-semibold">Category</Large>
          <CategoryPicker
            onSelect={(categoryId) => {
              setFieldValue("categoryId", categoryId);
              setFieldValue("attributes", {});
            }}
            selectedCategoryId={values.categoryId}
          />
        </Card>

        {values.categoryId &&
          match(attributesQuery)
            .with({ isLoading: true }, () => (
              <Card>
                <Spinner />
              </Card>
            ))
            .with({ isError: true }, () => (
              <Card>
                <Small className="text-arkaic-negative">
                  Failed to load attributes.
                </Small>
              </Card>
            ))
            .otherwise(({ data: attrs }) =>
              (attrs ?? []).length > 0 ? (
                <Card>
                  <Large className="font-semibold">Product details</Large>
                  <VStack space="md">
                    {(attrs ?? []).map((attr, i) => (
                      <React.Fragment key={attr.attributeId}>
                        {i > 0 && <Divider />}
                        <AttributeFormField
                          attr={attr}
                          value={values.attributes[String(attr.attributeId)]}
                          onChange={(val) =>
                            setFieldValue(`attributes.${attr.attributeId}`, val)
                          }
                        />
                      </React.Fragment>
                    ))}
                  </VStack>
                </Card>
              ) : null
            )}
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
