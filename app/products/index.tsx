import AppLayout from "@/components/layouts/app-layout";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useProducts } from "@/hooks/products/use-products";
import { useRouter } from "expo-router";
import { match } from "ts-pattern";

function Productssss() {
  const productsQuery = useProducts();

  return match(productsQuery)
    .with({ isLoading: true }, () => <Spinner className='mt-4' />)
    .with({ isError: true }, () => (
      <P className='text-red-500'>Failed to load products.</P>
    ))
    .otherwise(({ data: products }) =>
      products?.map((product) => (
        <Card key={product.id} className='p-4'>
          <Large>{product.nome}</Large>
          <Small className='mt-1'>Price: {product.prezzo} sats</Small>
          <Small className='mt-1'>Seller: {product.sellerPubkey} sats</Small>
        </Card>
      )),
    );
}

export default function ProductsList() {
  const router = useRouter();

  return (
    <AppLayout>
      <VStack space='lg'>
        <Large className='font-heading'>Products</Large>

        <Button
          onPress={() => router.push("/products/create")}
          className='w-max'
        >
          <ButtonText>Create Product</ButtonText>
        </Button>
        <VStack>
          <VStack space={"sm"}>
            <Productssss />
          </VStack>
        </VStack>
      </VStack>
    </AppLayout>
  );
}
