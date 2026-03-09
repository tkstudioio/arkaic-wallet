import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Large, P } from "@/components/ui/typography";
import { useBuyProduct } from "@/hooks/products/use-buy-product";
import { useBuyerCollaborate } from "@/hooks/products/use-buyer-collaborate";
import { useProduct } from "@/hooks/products/use-product";
import { useRefund } from "@/hooks/products/use-refund";
import { useSellerCollaborate } from "@/hooks/products/use-seller-collaborate";
import { isAfter } from "date-fns";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function ProductDetailsComponent({ id }: { id: number }) {
  const { data: product } = useProduct(id);

  const { mutate: buyProduct, isPending } = useBuyProduct();
  const { mutate: refund } = useRefund();
  const { mutate: sellerCollaborate } = useSellerCollaborate();
  const { mutate: buyerCollaborate } = useBuyerCollaborate();

  if (!product) return <P>No product</P>;

  return (
    <Card>
      <Large>{product.nome}</Large>
      <P>Price: {product.prezzo} sats</P>
      <P>Seller: {product.sellerPubkey.slice(0, 7)}</P>
      <P>Status: {product.status}</P>
      <VStack space={"xl"}>
        {product.status === "awaitingFunds" ? (
          <Button onPress={() => buyProduct(product)} isDisabled={isPending}>
            <ButtonText>Buy {isPending && <Spinner />}</ButtonText>
          </Button>
        ) : (
          <>
            <Button onPress={() => sellerCollaborate(product)}>
              <ButtonText>
                Seller - collaborate {isPending && <Spinner />}
              </ButtonText>
            </Button>

            <Button onPress={() => buyerCollaborate(product)}>
              <ButtonText>
                Buyer - collaborate {isPending && <Spinner />}
              </ButtonText>
            </Button>

            {isAfter(new Date(), product.timelockExpiry) && (
              <Button onPress={() => refund(product)}>
                <ButtonText>
                  Buyer - claim refund {isPending && <Spinner />}
                </ButtonText>
              </Button>
            )}
          </>
        )}
      </VStack>
    </Card>
  );
}
