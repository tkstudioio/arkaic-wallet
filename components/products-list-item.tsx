import { Card } from "@/components/ui/card";

import { Large } from "@/components/ui/typography";

import { Link } from "expo-router";
import { Fingerprint } from "lucide-react-native";

import { Product } from "@/types/product";
import { AmountComponent } from "./amount";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { VStack } from "./ui/vstack";

export function ProductsListItem({ product }: { product: Product }) {
  return (
    <Link
      key={product.id}
      href={{
        pathname: "/products/[id]",
        params: { id: product.id },
      }}
      className='w-full'
    >
      <Card className='justify-start w-full'>
        <Badge size={"lg"}>
          <BadgeIcon as={Fingerprint} />
          <BadgeText>{product.sellerPubkey.slice(0, 7)}</BadgeText>
        </Badge>

        <Large>{product.nome}</Large>

        <VStack className='w-full items-end'>
          <AmountComponent size='4xl' amount={product.prezzo} />
        </VStack>
      </Card>
    </Link>
  );
}
