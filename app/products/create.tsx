import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { H1, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateProduct } from "@/hooks/products/use-create-product";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function ProductCreate() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { account, wallet } = useAccountStore();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  if (!account?.privateKey || !wallet) {
    router.replace("/");
    return null;
  }

  const handleSubmit = () => {
    createProduct.mutate(
      {
        name: name.trim(),
        price: Number(price),
      },
      { onSuccess: () => router.replace("/products") },
    );
  };

  return (
    <VStack space='lg'>
      <H1 className='font-heading'>Create Product</H1>

      <VStack space='xs'>
        <Small>Name</Small>
        <Input>
          <InputField
            placeholder='Product name'
            value={name}
            onChangeText={setName}
          />
        </Input>
      </VStack>

      <VStack space='xs'>
        <Small>Price (sats)</Small>
        <Input>
          <InputField
            placeholder='0'
            value={price}
            onChangeText={setPrice}
            keyboardType='numeric'
          />
        </Input>
      </VStack>

      {createProduct.isError && (
        <P className='text-red-500'>Failed to create product.</P>
      )}

      <Button onPress={handleSubmit} isDisabled={createProduct.isPending}>
        <ButtonText>
          {createProduct.isPending ? "Creating..." : "Create"}
        </ButtonText>
      </Button>

      <Button variant='outline' onPress={() => router.back()}>
        <ButtonText>Back to List</ButtonText>
      </Button>
    </VStack>
  );
}
