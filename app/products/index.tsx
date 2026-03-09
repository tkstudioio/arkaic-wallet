import AppLayout from "@/components/layouts/app-layout";
import { ProductsListComponent } from "@/components/products-list";
import { Button, ButtonText } from "@/components/ui/button";
import { Large } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useRouter } from "expo-router";

function Abc() {
  const router = useRouter();

  return (
    <Button onPress={() => router.push("/products/create")} className='w-max'>
      <ButtonText>Create Product</ButtonText>
    </Button>
  );
}
export default function ProductsList() {
  return (
    <AppLayout>
      <VStack space='lg'>
        <Large className='font-heading'>Products</Large>

        <Abc />

        <ProductsListComponent />
      </VStack>
    </AppLayout>
  );
}
