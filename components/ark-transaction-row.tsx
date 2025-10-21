import { ArkTransaction, TxType } from "@arkade-os/sdk";

import useSettingsStore from "@/stores/settings";

import { useTransactions } from "@/hooks/use-transactions";
import { find } from "lodash";

import { format, formatDistanceToNowStrict } from "date-fns";
import { ExternalLink } from "lucide-react-native";
import { Linking } from "react-native";
import { match } from "ts-pattern";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function ArkTransactionRow({
  transaction,
}: {
  transaction: ArkTransaction;
}) {
  const { detailedTransactions } = useSettingsStore();
  const { data: allTransactions } = useTransactions();
  const { commitmentTxid, arkTxid } = transaction.key;

  const onchainTransaction = find(
    allTransactions,
    ({ key }) => arkTxid !== "" && key.boardingTxid === commitmentTxid
  );

  console.log(allTransactions);

  // if (!onchainTransaction) {
  //   if (!transaction.settled) return; //
  //   else return;
  // }
  return (
    <HStack className='justify-between'>
      <VStack className='items-start w-max'>
        <HStack className='items-center' space={"sm"}>
          <Text>
            {transaction.type === TxType.TxSent ? "-" : "+"}
            {Intl.NumberFormat("it").format(transaction.amount)} sats
          </Text>
          {onchainTransaction ? (
            <Badge
              size={"sm"}
              action={transaction.type === TxType.TxSent ? "warning" : "info"}
            >
              <BadgeText>
                {transaction.type === TxType.TxSent ? "Offboard" : "Onboard"}
              </BadgeText>
            </Badge>
          ) : (
            <Badge
              size={"sm"}
              action={transaction.type === TxType.TxSent ? "error" : "success"}
            >
              <BadgeText>
                {transaction.type === TxType.TxSent ? "Spent" : "Received"}
              </BadgeText>
            </Badge>
          )}
        </HStack>
        {detailedTransactions &&
          (onchainTransaction ? (
            <Button
              onPress={() =>
                Linking.openURL(`https://mempool.space/it/tx/${commitmentTxid}`)
              }
              variant={"link"}
              className='w-max'
              size={"xs"}
            >
              <ButtonText>
                {commitmentTxid.substring(0, 8)}...
                {commitmentTxid.substring(
                  commitmentTxid.length - 8,
                  commitmentTxid.length
                )}
              </ButtonText>
              <ButtonIcon as={ExternalLink} />
            </Button>
          ) : (
            <Text size={"sm"}>
              {commitmentTxid.substring(0, 8)}...
              {commitmentTxid.substring(
                commitmentTxid.length - 8,
                commitmentTxid.length
              )}
            </Text>
          ))}
      </VStack>
      <VStack className='w-max items-end'>
        {transaction.createdAt ? (
          match(detailedTransactions)
            .with(false, () => (
              <Text>{formatDistanceToNowStrict(transaction.createdAt)}</Text>
            ))
            .otherwise(() => (
              <>
                <Text>{format(transaction.createdAt, "yyyy-MM-dd", {})}</Text>
                <Text>{format(transaction.createdAt, "HH:mm", {})}</Text>
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

  // se !boardingTxid -> transazione ark
  //    se arkTxid -> transazione ark to ark
  //    se commitmentTxid -> transazione ark to onchain
}

// import { ArkTransaction, TxType } from "@arkade-os/sdk";

// import useSettingsStore from "@/stores/settings";
// import { entries, filter, find } from "lodash";
// import { HStack } from "./ui/hstack";
// import { Text } from "./ui/text";

// import { format, formatDistanceToNowStrict } from "date-fns";
// import { enGB } from "date-fns/locale";
// import { ExternalLink } from "lucide-react-native";
// import { Linking } from "react-native";
// import { match } from "ts-pattern";
// import { Badge, BadgeText } from "./ui/badge";
// import { Button, ButtonIcon, ButtonText } from "./ui/button";
// import { Spinner } from "./ui/spinner";
// import { VStack } from "./ui/vstack";

// export function ArkTransactionRow({
//   transaction,
// }: {
//   transaction: ArkTransaction;
// }) {
//   const { detailedTransactions } = useSettingsStore();

//   const txKey = find(entries(transaction.key), ([, txId]) => txId !== "");
//   const txs = filter(entries(transaction.key), ([, txId]) => txId !== "");

//   if (!txKey) return <Text>Invalid transaction</Text>;

//   const [txType, txId] = txKey;

//   // se !boardingTxid -> transazione ark
//   //    se arkTxid -> transazione ark to ark
//   //    se commitmentTxid -> transazione ark to onchain
//   // altrimenti -> transazione onchain
//   //    se !createdAt -> transazione non confermata
//   //    altrimenti -> transazione confermata
//   //        se settled -> transazione ramp
//   //

//   // se arkTxid -> transazione ark
//   //    se commitmentTxid -> transazione ark spesa
//   //        se esiste una transazione con boardingTxid === commitmentTxid -> transazione rampa
//   //    se !commitmentTxid -> transazione ark non spesa
//   // se boardingTxid -> transazione onchain
//   //    se esiste una transazione con commitmentTxid === boardingTxid -> transazione rampa
//   //    se settled -> rampa confermata

//   return (
//     <HStack className='justify-between'>
//       <VStack className='items-start  w-max' space={"xs"}>
//         <HStack className='items-center ' space={"sm"}>
//           <Text size={"xl"}>
//             {!detailedTransactions &&
//               match(transaction.type)
//                 .with(TxType.TxReceived, () => "")
//                 .with(TxType.TxSent, () => "-")
//                 .exhaustive()}
//             {Intl.NumberFormat("it-IT").format(transaction.amount)} sats
//           </Text>
//           {detailedTransactions &&
//             match(txType)
//               .with("boardingTxid", () => (
//                 <Badge
//                   size={"sm"}
//                   action={
//                     transaction.type === TxType.TxReceived ? "info" : "warning"
//                   }
//                   className='gap-1 w-max'
//                 >
//                   <BadgeText>
//                     {transaction.type === TxType.TxReceived
//                       ? "Onboard"
//                       : "Offboard"}
//                   </BadgeText>
//                 </Badge>
//               ))
//               .with("commitmentTxid", "arkTxid", () => (
//                 <Badge
//                   size={"sm"}
//                   action={
//                     transaction.type === TxType.TxReceived ? "success" : "error"
//                   }
//                   className='gap-1 w-max'
//                 >
//                   <BadgeText>
//                     {transaction.type === TxType.TxReceived
//                       ? "Received"
//                       : "Spent"}
//                   </BadgeText>
//                 </Badge>
//               ))
//               .otherwise(() => (
//                 <Badge size={"sm"} action={"error"} className='gap-1 w-max'>
//                   <BadgeText>Unknown</BadgeText>
//                 </Badge>
//               ))}
//         </HStack>
//         <Text>{txType}</Text>
//         {detailedTransactions
//           ? match(txType)
//               .with("boardingTxid", () => (
//                 <Button
//                   onPress={() =>
//                     Linking.openURL(
//                       `https://mempool.space/it/tx/${
//                         transaction.key.boardingTxid ||
//                         transaction.key.commitmentTxid
//                       }`
//                     )
//                   }
//                   variant={"link"}
//                   className='w-max'
//                   size={"xs"}
//                 >
//                   <ButtonText>
//                     {txId.substring(0, 8)}...
//                     {txId.substring(txId.length - 8, txId.length)}
//                   </ButtonText>
//                   <ButtonIcon as={ExternalLink} />
//                 </Button>
//               ))
//               .otherwise(() => (
//                 <Text size={"xs"}>
//                   {txId.substring(0, 8)}...
//                   {txId.substring(txId.length - 8, txId.length)}
//                 </Text>
//               ))
//           : null}
//       </VStack>
//       <VStack className='w-max items-end'>
//         {transaction.createdAt ? (
//           match(detailedTransactions)
//             .with(false, () => (
//               <Text>{formatDistanceToNowStrict(transaction.createdAt)}</Text>
//             ))
//             .otherwise(() => (
//               <>
//                 <Text>
//                   {format(transaction.createdAt, "yyyy-MM-dd", {
//                     locale: enGB,
//                   })}
//                 </Text>
//                 <Text>
//                   {format(transaction.createdAt, "HH:mm", {
//                     locale: enGB,
//                   })}
//                 </Text>
//               </>
//             ))
//         ) : (
//           <HStack className='items-center' space={"xs"}>
//             <Spinner />
//             <Text>Waiting onchain confirm</Text>
//           </HStack>
//         )}
//       </VStack>
//     </HStack>
//   );

//   // return (
//   //   <HStack key={txId} className='items-center justify-between'>
//   //     <VStack space={"md"}>
//   //       {/* <VStack space={"xs"}>
//   //         {!transaction.createdAt ? (
//   //
//   //
//   //
//   //
//   //         ) : (
//   //           <Heading size={"sm"}>
//   //             {format(transaction.createdAt, "dd/MM/yyyy")}
//   //           </Heading>
//   //         )}

//   //         {!transaction.createdAt ? null : (
//   //           <Text size={"sm"}>{format(transaction.createdAt, "HH:mm")}</Text>
//   //         )}
//   //       </VStack> */}

//   //     <VStack className='items-end'>
//   //       {/* <Button
//   //         disabled
//   //         className='gap-1'
//   //         size={"xl"}
//   //         variant={"link"}
//   //         action={
//   //           transaction.type === TxType.TxReceived ? "positive" : "negative"
//   //         }
//   //       >
//   //         {transaction.type === TxType.TxReceived ? (
//   //           <ButtonIcon as={Plus} />
//   //         ) : (
//   //           <ButtonIcon as={Minus} />
//   //         )}
//   //         <ButtonText>

//   //         </ButtonText>
//   //       </Button> */}
//   //       {/* {!transaction.key.arkTxid &&
//   //       (transaction.key.boardingTxid || transaction.key.commitmentTxid) ? (
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //
//   //       ) : null} */}
//   //     </VStack>
//   //   </HStack>
//   // );
// }
