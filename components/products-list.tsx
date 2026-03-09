import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Large, P, Small } from "@/components/ui/typography";
import { useProducts } from "@/hooks/products/use-products";
import { Link, useRouter } from "expo-router";
import { Fingerprint } from "lucide-react-native";
import { match } from "ts-pattern";
import { VStack } from "./ui/vstack";

export function ProductsListComponent() {
  const productsQuery = useProducts();
  const router = useRouter();
  return (
    <VStack space={"sm"}>
      {match(productsQuery)
        .with({ isLoading: true }, () => <Spinner className='mt-4' />)
        .with({ isError: true }, () => (
          <P className='text-red-500'>Failed to load products.</P>
        ))
        .otherwise(({ data: products }) =>
          products?.map((product) => (
            <Link
              key={product.id}
              href={{
                pathname: "/products/[id]",
                params: { id: product.id },
              }}
            >
              <Card className='p-4'>
                <Small className='mt-1 flex items-center gap-1'>
                  <Fingerprint className='w-4' />
                  {product.sellerPubkey.slice(0, 7)}
                </Small>
                <Large>{product.nome}</Large>
                <P className='mt-1'>{product.prezzo} sats</P>
              </Card>
            </Link>
          )),
        )}
    </VStack>
  );
}
