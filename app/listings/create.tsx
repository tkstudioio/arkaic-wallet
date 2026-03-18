import { CategoryPicker } from "@/components/category-picker";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateProduct } from "@/hooks/listings/use-create-listing";

import { useRouter } from "expo-router";
import { Formik } from "formik";
import { toNumber, toString } from "lodash";
import { ArrowLeft, Camera } from "lucide-react-native";
import { ScrollView } from "react-native";

export default function ProductCreate() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        price: 0,
        categoryId: null as number | null,
      }}
      onSubmit={(values) =>
        createProduct.mutate({
          name: values.name,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId!,
        })
      }
    >
      {({ handleSubmit, values, setFieldValue, handleChange }) => (
        <VStack className='flex-1 h-full'>
          <VStack space={"md"}>
            <HStack className='items-center' space='md'>
              <Button
                action='neutral'
                variant='link'
                onPress={router.back}
                className='w-max'
              >
                <ButtonIcon as={ArrowLeft} />
              </Button>
              <Small className='font-semibold'>Go back</Small>
            </HStack>
            <Divider />
          </VStack>

          <ScrollView className='flex-1 py-arkaic-md'>
            <VStack space={"md"} className='w-full'>
              <Button
                action={"neutral"}
                variant={"outline"}
                className='w-max aspect-video'
              >
                <ButtonIcon as={Camera} />
                <ButtonText>Add photo</ButtonText>
              </Button>
            </VStack>
            <VStack space='lg' className='py-4'>
              <VStack space='xs'>
                <Small>Name</Small>
                <Input>
                  <InputField
                    placeholder='Product name'
                    value={values.name}
                    onChangeText={handleChange("name")}
                  />
                </Input>
              </VStack>
              <CategoryPicker
                onSelect={(categoryId) =>
                  setFieldValue("categoryId", categoryId)
                }
                selectedCategoryId={values.categoryId}
              />
              <VStack space='xs'>
                <Small>Description</Small>
                <Input className='h-24'>
                  <InputField
                    multiline
                    textAlignVertical='top'
                    className='py-2'
                    placeholder='Product description'
                    value={values.description}
                    onChangeText={handleChange("description")}
                  />
                </Input>
              </VStack>

              <VStack space='xs'>
                <Small>Price (sats)</Small>
                <Input>
                  <InputField
                    placeholder='0'
                    value={toString(values.price)}
                    onChangeText={(value) =>
                      setFieldValue("price", toNumber(value))
                    }
                    keyboardType='numeric'
                  />
                </Input>
              </VStack>
            </VStack>
          </ScrollView>

          <VStack className='py-4'>
            <Button
              onPress={() => handleSubmit()}
              isDisabled={createProduct.isPending}
            >
              <ButtonText>
                {createProduct.isPending ? "Creating..." : "Create"}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      )}
    </Formik>
  );
}
