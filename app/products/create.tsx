import AppLayout from "@/components/layouts/app-layout";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useCreateProduct } from "@/hooks/products/use-create-product";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

function Bismillah() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { account, wallet } = useAccountStore();

  const [nome, setNome] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [sellerPubkey, setSellerPubkey] = useState("");

  useEffect(() => {
    if (!account?.privateKey || !wallet) {
      router.replace("/");
      return;
    }

    const derivePublicKey = async () => {
      const pubkeyBytes = await wallet.identity.compressedPublicKey();
      const pubkey = Array.from(pubkeyBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setSellerPubkey(pubkey);
    };

    derivePublicKey();
  }, [account?.privateKey]);

  const handleSubmit = () => {
    createProduct.mutate(
      {
        nome: nome.trim(),
        prezzo: Number(prezzo),
        sellerPubkey,
      },
      { onSuccess: () => router.replace("/products") },
    );
  };

  return (
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

export default function ProductCreate() {
  return (
    <AppLayout>
      <Bismillah />
    </AppLayout>
  );
}
