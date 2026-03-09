import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Large, P } from "@/components/ui/typography";
import { useBuyProduct } from "@/hooks/products/use-buy-product";
import { useBuyerConfirmCollaborate } from "@/hooks/products/use-buyer-confirm-collaborate";
import { useProduct } from "@/hooks/products/use-product";
import { useRefund } from "@/hooks/products/use-refund";
import { useSellerSignCheckpoints } from "@/hooks/products/use-seller-sign-checkpoints";
import { useSellerSignCollaborate } from "@/hooks/products/use-seller-sign-collaborate";
import { isAfter } from "date-fns";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function ProductDetailsComponent({ id }: { id: number }) {
  const { data: product } = useProduct(id);

  const { mutate: buyProduct, isPending } = useBuyProduct();
  const { mutate: refund } = useRefund();
  const { mutate: sellerSignCollaborate } = useSellerSignCollaborate();
  const { mutate: sellerSignCheckpoints } = useSellerSignCheckpoints();
  const { mutate: buyerConfirmCollaborate } = useBuyerConfirmCollaborate();

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
            <Button onPress={() => sellerSignCollaborate(product)}>
              <ButtonText>
                Seller - sign collaborate {isPending && <Spinner />}
              </ButtonText>
            </Button>

            <Button onPress={() => sellerSignCheckpoints(product)}>
              <ButtonText>
                Seller - sign checkpoints {isPending && <Spinner />}
              </ButtonText>
            </Button>

            <Button onPress={() => buyerConfirmCollaborate(product)}>
              <ButtonText>
                Buyer - confirm collaborate {isPending && <Spinner />}
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
