import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { H1, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateProduct } from "@/hooks/products/use-create-listing";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { toNumber, toString } from "lodash";

export default function ProductCreate() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { account, wallet } = useAccountStore();

  if (!account?.privateKey || !wallet) {
    router.replace("/");
    return null;
  }

  return (
    <Formik
      initialValues={{ name: "", price: 0 }}
      onSubmit={(values) =>
        createProduct.mutate(values, {
          onSuccess: () => router.replace("/products"),
        })
      }
    >
      {({ handleSubmit, values, setFieldValue, handleChange }) => (
        <VStack space='lg'>
          <H1 className='font-heading'>Create Product</H1>
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
          {createProduct.isError && (
            <P className='text-red-500'>Failed to create product.</P>
          )}

          <Button
            onPress={() => handleSubmit()}
            isDisabled={createProduct.isPending}
          >
            <ButtonText>
              {createProduct.isPending ? "Creating..." : "Create"}
            </ButtonText>
          </Button>

          <Button variant='outline' onPress={() => router.back()}>
            <ButtonText>Back to List</ButtonText>
          </Button>
        </VStack>
      )}
    </Formik>
  );
}
