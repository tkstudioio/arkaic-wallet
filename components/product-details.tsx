import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { useBuyProduct } from "@/hooks/products/use-buy-product";
import { useBuyerConfirmCollaborate } from "@/hooks/products/use-buyer-confirm-collaborate";
import { useProduct } from "@/hooks/products/use-product";
import { useRefund } from "@/hooks/products/use-refund";
import { useSellerSignCheckpoints } from "@/hooks/products/use-seller-sign-checkpoints";
import { useSellerSignCollaborate } from "@/hooks/products/use-seller-sign-collaborate";
import useAccountStore from "@/stores/account";
import { ProductEvent } from "@/types/product";
import { hex } from "@scure/base";
import { format } from "date-fns";
import { isAfter } from "date-fns";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

const EVENT_LABELS: Record<string, string> = {
  created: "Product created",
  funds_locked: "Funds locked by buyer",
  seller_signed_psbt: "Seller signed collaborate PSBT",
  buyer_signed_psbt: "Buyer signed collaborate PSBT",
  buyer_signed_checkpoints: "Buyer signed checkpoints",
  seller_signed_checkpoints: "Seller signed checkpoints — funds released",
  refund_submitted: "Refund submitted",
  refund_finalized: "Refund finalized",
};

function ActivityLog({ events }: { events: ProductEvent[] }) {
  if (events.length === 0) return null;

  return (
    <VStack space="sm" className="mt-4">
      <P className="font-heading">Activity</P>
      {events.map((event, index) => (
        <View
          key={event.id}
          className="flex-row items-start gap-2 border-l-2 border-outline-200 pl-3"
          style={index === events.length - 1 ? { borderColor: "transparent" } : undefined}
        >
          <View className="flex-1">
            <Small>{EVENT_LABELS[event.action] ?? event.action}</Small>
            <Muted>{format(new Date(event.createdAt), "MMM d, HH:mm")}</Muted>
          </View>
        </View>
      ))}
    </VStack>
  );
}

export function ProductDetailsComponent({ id }: { id: number }) {
  const { data: product } = useProduct(id);
  const { wallet } = useAccountStore();

  const [userCompressedPubkey, setUserCompressedPubkey] = useState<string | null>(null);
  const [userXOnlyPubkey, setUserXOnlyPubkey] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet) return;
    wallet.identity.compressedPublicKey().then((bytes) => {
      setUserCompressedPubkey(hex.encode(bytes));
      setUserXOnlyPubkey(hex.encode(bytes.length === 33 ? bytes.slice(1) : bytes));
    });
  }, [wallet]);

  const { mutate: buyProduct, isPending: isBuying } = useBuyProduct();
  const { mutate: refund, isPending: isRefunding } = useRefund();
  const { mutate: sellerSignCollaborate, isPending: isSellerSigning } =
    useSellerSignCollaborate();
  const { mutate: sellerSignCheckpoints, isPending: isSellerCheckpoints } =
    useSellerSignCheckpoints();
  const { mutate: buyerConfirmCollaborate, isPending: isBuyerConfirming } =
    useBuyerConfirmCollaborate();

  if (!product) return <P>No product</P>;

  const isSeller =
    userCompressedPubkey === product.sellerPubkey ||
    userXOnlyPubkey === product.sellerPubkey;
  const isBuyer =
    userCompressedPubkey === product.buyerPubkey ||
    userXOnlyPubkey === product.buyerPubkey;
  const timelockExpired = isAfter(new Date(), product.timelockExpiry);
  const status = product.status;

  return (
    <Card>
      <Large>{product.nome}</Large>
      <P>Price: {product.prezzo} sats</P>
      <P>Seller: {product.sellerPubkey.slice(0, 7)}</P>
      <P>Status: {status}</P>

      <VStack space="xl" className="mt-4">
        {/* awaitingFunds: seller waits, others can buy */}
        {status === "awaitingFunds" &&
          (isSeller ? (
            <Muted>Waiting for a buyer…</Muted>
          ) : (
            <Button onPress={() => buyProduct(product)} isDisabled={isBuying}>
              <ButtonText>Buy {isBuying && <Spinner />}</ButtonText>
            </Button>
          ))}

        {/* fundLocked: seller signs collaborate, buyer can only refund (after timelock) */}
        {status === "fundLocked" && (
          <>
            {isSeller && (
              <Button
                onPress={() => sellerSignCollaborate(product)}
                isDisabled={isSellerSigning}
              >
                <ButtonText>
                  Sign collaborate {isSellerSigning && <Spinner />}
                </ButtonText>
              </Button>
            )}
            {isBuyer && (
              <Button
                onPress={() => refund(product)}
                isDisabled={!timelockExpired || isRefunding}
              >
                <ButtonText>
                  Claim refund {isRefunding && <Spinner />}
                </ButtonText>
              </Button>
            )}
          </>
        )}

        {/* sellerReady: seller waits, buyer can collaborate or refund */}
        {status === "sellerReady" && (
          <>
            {isSeller && <Muted>Waiting for buyer to collaborate…</Muted>}
            {isBuyer && (
              <>
                <Button
                  onPress={() => buyerConfirmCollaborate(product)}
                  isDisabled={isBuyerConfirming}
                >
                  <ButtonText>
                    Confirm collaborate {isBuyerConfirming && <Spinner />}
                  </ButtonText>
                </Button>
                <Button
                  onPress={() => refund(product)}
                  isDisabled={!timelockExpired || isRefunding}
                >
                  <ButtonText>
                    Claim refund {isRefunding && <Spinner />}
                  </ButtonText>
                </Button>
              </>
            )}
          </>
        )}

        {/* buyerSubmitted / buyerCheckpointsSigned: seller signs checkpoints, buyer waits */}
        {(status === "buyerSubmitted" ||
          status === "buyerCheckpointsSigned") && (
          <>
            {isSeller && (
              <Button
                onPress={() => sellerSignCheckpoints(product)}
                isDisabled={isSellerCheckpoints}
              >
                <ButtonText>
                  Sign checkpoints {isSellerCheckpoints && <Spinner />}
                </ButtonText>
              </Button>
            )}
            {isBuyer && (
              <Muted>Waiting for seller to finalize…</Muted>
            )}
          </>
        )}

        {/* payed: completed */}
        {status === "payed" && <Muted>Transaction completed</Muted>}

        {/* refunded: refunded */}
        {status === "refunded" && <Muted>Funds refunded to buyer</Muted>}
      </VStack>

      {product.events && <ActivityLog events={product.events} />}
    </Card>
  );
}
