import { Card } from "@/components/ui/card";
import { Large, Muted, P, Small } from "@/components/ui/typography";
import { useProduct } from "@/hooks/products/use-product";
import { ProductEvent } from "@/types/product";
import { format } from "date-fns";

import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { useLocalSearchParams } from "expo-router";
import { toNumber } from "lodash";
import { View } from "react-native";

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

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const castedId = toNumber(id);

  if (isNaN(castedId)) throw new Error("Wrong id");
  const { data: product, isLoading } = useProduct(toNumber(id));

  if (isLoading) return <Spinner />;
  if (!product) return <P>No product</P>;

  return (
    <Card>
      <Large>{product.name}</Large>
      <P>Price: {product.price} sats</P>
      <P>Seller: {product.seller?.pubkey?.slice(0, 7) ?? "Unknown"}</P>

      {/* Chat and escrow UI — task 05/06 */}

      {product.events && <ActivityLog events={product.events} />}
    </Card>
  );
}

function ActivityLog({ events }: { events: ProductEvent[] }) {
  if (events.length === 0) return null;

  return (
    <VStack space='sm' className='mt-4'>
      <P className='font-heading'>Activity</P>
      {events.map((event, index) => (
        <View
          key={event.id}
          className='flex-row items-start gap-2 border-l-2 border-outline-200 pl-3'
          style={
            index === events.length - 1
              ? { borderColor: "transparent" }
              : undefined
          }
        >
          <View className='flex-1'>
            <Small>{EVENT_LABELS[event.action] ?? event.action}</Small>
            <Muted>{format(new Date(event.createdAt), "MMM d, HH:mm")}</Muted>
          </View>
        </View>
      ))}
    </VStack>
  );
}
