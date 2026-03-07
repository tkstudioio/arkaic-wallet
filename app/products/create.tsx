import PublicLayout from "@/components/layouts/public-layout";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateProduct } from "@/hooks/products/use-create-product";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";

function Bismillah() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [nome, setNome] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [sellerPubkey, setSellerPubkey] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Name is required";
    if (!prezzo.trim()) newErrors.prezzo = "Price is required";
    else if (isNaN(Number(prezzo)) || Number(prezzo) <= 0)
      newErrors.prezzo = "Price must be a positive number";
    if (!sellerPubkey.trim())
      newErrors.sellerPubkey = "Seller pubkey is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createProduct.mutate(
      {
        nome: nome.trim(),
        prezzo: Number(prezzo),
        sellerPubkey: sellerPubkey.trim(),
      },
      { onSuccess: () => router.replace("/products/list") },
    );
  };

  return (
    <ScrollView className='flex-1 p-4'>
      <VStack space='lg'>
        <Large className='font-heading'>Create Product</Large>

        <VStack space='xs'>
          <Small>Name</Small>
          <Input>
            <InputField
              placeholder='Product name'
              value={nome}
              onChangeText={setNome}
            />
          </Input>
          {errors.nome && <P className='text-red-500 text-sm'>{errors.nome}</P>}
        </VStack>

        <VStack space='xs'>
          <Small>Price (sats)</Small>
          <Input>
            <InputField
              placeholder='0'
              value={prezzo}
              onChangeText={setPrezzo}
              keyboardType='numeric'
            />
          </Input>
          {errors.prezzo && (
            <P className='text-red-500 text-sm'>{errors.prezzo}</P>
          )}
        </VStack>

        <VStack space='xs'>
          <Small>Seller Public Key</Small>
          <Input>
            <InputField
              placeholder='Public key'
              value={sellerPubkey}
              onChangeText={setSellerPubkey}
            />
          </Input>
          {errors.sellerPubkey && (
            <P className='text-red-500 text-sm'>{errors.sellerPubkey}</P>
          )}
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
    </ScrollView>
  );
}

export default function ProductCreate() {
  return (
    <PublicLayout>
      <Bismillah />
    </PublicLayout>
  );
}
