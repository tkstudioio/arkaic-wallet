import AppLayout from "@/components/layouts/app-layout";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateProduct } from "@/hooks/products/use-create-product";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";

function Bismillah() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { account } = useAccountStore();

  const [nome, setNome] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [sellerPubkey, setSellerPubkey] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(account);

  useEffect(() => {
    // if (!account?.privateKey) {
    //   router.replace("/");
    //   return;
    // }
    // const derivePublicKey = async () => {
    //   const identity = SingleKey.fromHex(account.privateKey!);
    //   const pubkeyBytes = await identity.compressedPublicKey();
    //   const pubkey = Array.from(pubkeyBytes)
    //     .map((b) => b.toString(16).padStart(2, "0"))
    //     .join("");
    //   setSellerPubkey(pubkey);
    // };
    // derivePublicKey();
  }, [account?.privateKey]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Name is required";
    if (!prezzo.trim()) newErrors.prezzo = "Price is required";
    else if (isNaN(Number(prezzo)) || Number(prezzo) <= 0)
      newErrors.prezzo = "Price must be a positive number";
    if (!sellerPubkey) newErrors.sellerPubkey = "Public key not available";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createProduct.mutate(
      {
        nome: nome.trim(),
        prezzo: Number(prezzo),
        sellerPubkey,
      },
      { onSuccess: () => router.replace("/products") },
    );
  };

  if (!account?.privateKey) return null;

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

function Bismillah2() {
  const { account } = useAccountStore();
  return <P>Ciao {account?.name}</P>;
}
export default function ProductCreate() {
  return (
    <AppLayout>
      <Bismillah2 />
    </AppLayout>
  );
}
