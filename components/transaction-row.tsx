import { ArkTransaction, TxType } from "@arkade-os/sdk";

import useSettingsStore from "@/stores/settings";
import { entries, find } from "lodash";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";

import { format, formatDistanceToNowStrict } from "date-fns";
import { enGB } from "date-fns/locale";
import { ExternalLink } from "lucide-react-native";
import { Linking } from "react-native";
import { match } from "ts-pattern";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { VStack } from "./ui/vstack";

export function TransactionRow({
  transaction,
}: {
  transaction: ArkTransaction;
}) {
  const { detailedTransactions } = useSettingsStore();
  const txKey = find(entries(transaction.key), ([, txId]) => txId !== "");
  if (!txKey) return <Text>Invalid transaction</Text>;

  const [txType, txId] = txKey;

  return (
    <HStack className='justify-between'>
      <VStack className='items-start  w-max' space={"xs"}>
        <HStack className='items-center ' space={"sm"}>
          <Text size={"xl"}>
            {!detailedTransactions &&
              match(transaction.type)
                .with(TxType.TxReceived, () => "")
                .with(TxType.TxSent, () => "-")
                .exhaustive()}
            {Intl.NumberFormat("it-IT").format(transaction.amount)} sats
          </Text>
          {detailedTransactions &&
            match(txType)
              .with("boardingTxid", () => (
                <Badge
                  size={"sm"}
                  action={
                    transaction.type === TxType.TxReceived ? "info" : "warning"
                  }
                  className='gap-1 w-max'
                >
                  <BadgeText>
                    {transaction.type === TxType.TxReceived
                      ? "Onboard"
                      : "Offboard"}
                  </BadgeText>
                </Badge>
              ))
              .with("commitmentTxid", "arkTxid", () => (
                <Badge
                  size={"sm"}
                  action={
                    transaction.type === TxType.TxReceived ? "success" : "error"
                  }
                  className='gap-1 w-max'
                >
                  <BadgeText>
                    {transaction.type === TxType.TxReceived
                      ? "Received"
                      : "Spent"}
                  </BadgeText>
                </Badge>
              ))
              .otherwise(() => (
                <Badge size={"sm"} action={"error"} className='gap-1 w-max'>
                  <BadgeText>Unknown</BadgeText>
                </Badge>
              ))}
        </HStack>
        {detailedTransactions
          ? match(txType)
              .with("boardingTxid", () => (
                <Button
                  onPress={() =>
                    Linking.openURL(
                      `https://mempool.space/it/tx/${
                        transaction.key.boardingTxid ||
                        transaction.key.commitmentTxid
                      }`
                    )
                  }
                  variant={"link"}
                  className='w-max'
                  size={"xs"}
                >
                  <ButtonText>
                    {txId.substring(0, 8)}...
                    {txId.substring(txId.length - 8, txId.length)}
                  </ButtonText>
                  <ButtonIcon as={ExternalLink} />
                </Button>
              ))
              .otherwise(() => (
                <Text size={"xs"}>
                  {txId.substring(0, 8)}...
                  {txId.substring(txId.length - 8, txId.length)}
                </Text>
              ))
          : null}
      </VStack>
      <VStack className='w-max items-end'>
        {transaction.createdAt ? (
          match(detailedTransactions)
            .with(false, () => (
              <Text>{formatDistanceToNowStrict(transaction.createdAt)}</Text>
            ))
            .otherwise(() => (
              <>
                <Text>
                  {format(transaction.createdAt, "yyyy-MM-dd", {
                    locale: enGB,
                  })}
                </Text>
                <Text>
                  {format(transaction.createdAt, "HH:mm", {
                    locale: enGB,
                  })}
                </Text>
              </>
            ))
        ) : (
          <HStack className='items-center' space={"xs"}>
            <Spinner />
            <Text>Waiting onchain confirm</Text>
          </HStack>
        )}
      </VStack>
    </HStack>
  );

  // return (
  //   <HStack key={txId} className='items-center justify-between'>
  //     <VStack space={"md"}>
  //       {/* <VStack space={"xs"}>
  //         {!transaction.createdAt ? (
  //
  //
  //
  //
  //         ) : (
  //           <Heading size={"sm"}>
  //             {format(transaction.createdAt, "dd/MM/yyyy")}
  //           </Heading>
  //         )}

  //         {!transaction.createdAt ? null : (
  //           <Text size={"sm"}>{format(transaction.createdAt, "HH:mm")}</Text>
  //         )}
  //       </VStack> */}

  //     <VStack className='items-end'>
  //       {/* <Button
  //         disabled
  //         className='gap-1'
  //         size={"xl"}
  //         variant={"link"}
  //         action={
  //           transaction.type === TxType.TxReceived ? "positive" : "negative"
  //         }
  //       >
  //         {transaction.type === TxType.TxReceived ? (
  //           <ButtonIcon as={Plus} />
  //         ) : (
  //           <ButtonIcon as={Minus} />
  //         )}
  //         <ButtonText>

  //         </ButtonText>
  //       </Button> */}
  //       {/* {!transaction.key.arkTxid &&
  //       (transaction.key.boardingTxid || transaction.key.commitmentTxid) ? (
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //       ) : null} */}
  //     </VStack>
  //   </HStack>
  // );
}
