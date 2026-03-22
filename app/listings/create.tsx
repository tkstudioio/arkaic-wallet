import { AttributeFormField } from "@/components/listing/attribute-form-field";
import { CategoryPicker } from "@/components/category-picker";
import { LocalPhoto, PhotoManager } from "@/components/listing/photo-manager";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCategoryAttributes } from "@/hooks/categories/use-category-attributes";
import { useCreateProduct } from "@/hooks/listings/use-create-listing";
import { useDeletePhoto } from "@/hooks/listings/use-delete-photo";
import { useListing } from "@/hooks/listings/use-listing";
import { useReorderPhotos } from "@/hooks/listings/use-reorder-photos";
import { useUpdateProduct } from "@/hooks/listings/use-update-listing";
import { useUploadPhotos } from "@/hooks/listings/use-upload-photos";
import { CreateListingAttribute, ListingAttributeValue } from "@/types/backend";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useFormik } from "formik";
import { toNumber, toString } from "lodash";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";
import { Divider } from "@/components/ui/divider";

type FormValues = {
  name: string;
  description: string;
  price: number;
  categoryId: number | null;
  attributes: Record<string, string | boolean | number[]>;
};

type EditablePhoto = LocalPhoto & { remoteId?: number };

function buildAttributeFormValues(
  attributes: ListingAttributeValue[] | undefined,
): Record<string, string | boolean | number[]> {
  if (!attributes) return {};

  const result: Record<string, string | boolean | number[]> = {};

  for (const attr of attributes) {
    const key = String(attr.attributeId);

    match(attr.attribute.type)
      .with("select", () => {
        if (attr.valueId !== null) {
          result[key] = String(attr.valueId);
        }
      })
      .with("boolean", () => {
        if (attr.valueBool !== null) {
          result[key] = attr.valueBool;
        }
      })
      .with("text", "range", "date", () => {
        if (attr.valueText !== null) {
          result[key] = attr.valueText;
        }
      })
      .with("multi_select", () => {
        if (attr.multiValues) {
          result[key] = attr.multiValues.map((mv) => mv.value.id);
        }
      })
      .otherwise(() => {});
  }

  return result;
}

function ProductCreateForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const listingQuery = useListing(id ?? "");

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadPhotos = useUploadPhotos();
  const deletePhoto = useDeletePhoto();
  const reorderPhotos = useReorderPhotos();

  const [photos, setPhotos] = useState<EditablePhoto[]>([]);
  const didPopulate = useRef(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: null,
      attributes: {},
    },
    onSubmit: async (values) => {
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

      if (isEditMode && id) {
        await updateProduct.mutateAsync({
          id: Number(id),
          name: values.name,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId!,
          attributes: attributeValues,
        });

        const originalPhotoIds = (listingQuery.data?.photos ?? []).map((p) => p.id);
        const currentRemoteIds = photos
          .filter((p) => p.remoteId !== undefined)
          .map((p) => p.remoteId!);
        const removedPhotoIds = originalPhotoIds.filter((pid) => !currentRemoteIds.includes(pid));

        for (const photoId of removedPhotoIds) {
          await deletePhoto.mutateAsync({ listingId: Number(id), photoId });
        }

        const newPhotos = photos.filter((p) => !p.remoteId);
        let newPhotoIds: number[] = [];
        if (newPhotos.length > 0) {
          const uploaded = await uploadPhotos.mutateAsync({
            listingId: Number(id),
            uris: newPhotos.map((p) => p.uri),
          });
          newPhotoIds = uploaded.map((p) => p.id);
        }

        // Build final order: map each photo to its remote ID (existing) or
        // the corresponding newly uploaded ID (in upload order)
        let newIdx = 0;
        const finalOrder: number[] = [];
        for (const p of photos) {
          if (p.remoteId) {
            finalOrder.push(p.remoteId);
          } else {
            if (newIdx < newPhotoIds.length) {
              finalOrder.push(newPhotoIds[newIdx]);
              newIdx++;
            }
          }
        }

        if (finalOrder.length > 0) {
          await reorderPhotos.mutateAsync({
            listingId: Number(id),
            photoIds: finalOrder,
          });
        }

        router.back();
      } else {
        const listing = await createProduct.mutateAsync({
          name: values.name,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId!,
          attributes: attributeValues,
        });

        if (photos.length > 0) {
          await uploadPhotos.mutateAsync({
            listingId: listing.id,
            uris: photos.map((p) => p.uri),
          });
        }

        router.replace("/listings/my-listings");
      }
    },
  });

  const { values, setFieldValue, handleChange, handleSubmit } = formik;

  useEffect(() => {
    if (!isEditMode || !listingQuery.data || didPopulate.current) return;
    didPopulate.current = true;

    const listing = listingQuery.data;

    formik.setValues({
      name: listing.name,
      description: listing.description ?? "",
      price: listing.price,
      categoryId: listing.categoryId ?? null,
      attributes: buildAttributeFormValues(listing.attributes),
    });

    if (listing.photos && listing.photos.length > 0) {
      const existingPhotos: EditablePhoto[] = listing.photos
        .sort((a, b) => a.position - b.position)
        .map((p) => ({
          id: String(p.id),
          uri: p.url,
          remoteId: p.id,
        }));
      setPhotos(existingPhotos);
    }
  }, [isEditMode, listingQuery.data]);

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
    !createProduct.isPending &&
    !updateProduct.isPending &&
    !uploadPhotos.isPending &&
    !deletePhoto.isPending &&
    !reorderPhotos.isPending;

  function handlePhotosChange(newPhotos: LocalPhoto[]) {
    const photosWithRemoteIds: EditablePhoto[] = newPhotos.map((np) => {
      const existing = photos.find((p) => p.id === np.id);
      return existing?.remoteId ? { ...np, remoteId: existing.remoteId } : np;
    });
    setPhotos(photosWithRemoteIds);
  }

  if (isEditMode && listingQuery.isLoading) {
    return (
      <VStack className="flex-1 items-center justify-center">
        <Spinner />
      </VStack>
    );
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
          <PhotoManager photos={photos} onPhotosChange={handlePhotosChange} />
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
          {isEditMode && listingQuery.data?.category && !values.categoryId && (
            <HStack className="items-center gap-2">
              <Small className="text-arkaic-muted">Current:</Small>
              <P>
                {listingQuery.data.category.parent
                  ? `${listingQuery.data.category.parent.name} > ${listingQuery.data.category.name}`
                  : listingQuery.data.category.name}
              </P>
            </HStack>
          )}
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
          {(createProduct.isPending || updateProduct.isPending || uploadPhotos.isPending || deletePhoto.isPending || reorderPhotos.isPending) && <Spinner />}
          <ButtonText>
            {match({
              creating: createProduct.isPending,
              updating: updateProduct.isPending,
              uploading: uploadPhotos.isPending,
              deleting: deletePhoto.isPending,
              reordering: reorderPhotos.isPending,
              isEditMode,
            })
              .with({ uploading: true }, () => "Uploading photos...")
              .with({ deleting: true }, () => "Removing photos...")
              .with({ reordering: true }, () => "Reordering photos...")
              .with({ updating: true }, () => "Updating...")
              .with({ creating: true }, () => "Creating...")
              .otherwise(() => (isEditMode ? "Save changes" : "Create"))}
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}

export default function ProductCreate() {
  return <ProductCreateForm />;
}
