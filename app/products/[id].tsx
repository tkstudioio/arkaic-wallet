import AppLayout from "@/components/layouts/app-layout";
import { ProductDetailsComponent } from "@/components/product-details";

import { useLocalSearchParams } from "expo-router";
import { isNaN, toNumber } from "lodash";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const castedId = toNumber(id);

  if (isNaN(castedId)) throw new Error("Wrong id");

  return (
    <AppLayout>
      <ProductDetailsComponent id={castedId} />
    </AppLayout>
  );
}
