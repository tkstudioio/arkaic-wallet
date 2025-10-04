import { ArkTransaction } from "@arkade-os/sdk";
import { format } from "date-fns";
import { View } from "react-native";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";

export function TransactionRow({
  transaction,
}: {
  transaction: ArkTransaction;
}) {
  return (
    <View
      key={transaction.key.boardingTxid}
      className='flex flex-row items-center justify-between py-3'
    >
      <View>
        <Heading size={"sm"}>
          {format(transaction.createdAt, "dd/MM/yyyy")}
        </Heading>
        <Text>{format(transaction.createdAt, "HH:mm")}</Text>
      </View>
      <View className='flex-row gap-1 items-baseline'>
        <Heading>{Intl.NumberFormat("it").format(transaction.amount)}</Heading>
        <Text>SATS</Text>
      </View>
    </View>
  );
}
