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

export function OnchainTransactionRow({
  transaction,
}: {
  transaction: ArkTransaction;
}) {
  const { detailedTransactions } = useSettingsStore();
  const { data: allTransactions } = useTransactions();
  const { boardingTxid, commitmentTxid, arkTxid } = transaction.key;

  const arkTransaction = find(
    allTransactions,
    ({ key }) => key.commitmentTxid === boardingTxid
  );

  if (!arkTransaction) {
    if (!transaction.settled) return; //
    else return;
  }
  return (
    <HStack className='justify-between'>
      <VStack className='items-start w-max'>
        <HStack className='items-center' space={"sm"}>
          <Text>
            {transaction.type === TxType.TxSent ? "-" : "+"}
            {Intl.NumberFormat("it").format(transaction.amount)} sats
          </Text>
          {arkTransaction ? (
            <Badge
              size={"sm"}
              action={transaction.settled ? "warning" : "info"}
            >
              <BadgeText>
                {transaction.settled ? "Onboard" : "Offboard"}
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
        {detailedTransactions && (
          <Button
            onPress={() =>
              Linking.openURL(`https://mempool.space/it/tx/${boardingTxid}`)
            }
            variant={"link"}
            className='w-max'
            size={"xs"}
          >
            <ButtonText>
              {boardingTxid.substring(0, 8)}...
              {boardingTxid.substring(
                boardingTxid.length - 8,
                boardingTxid.length
              )}
            </ButtonText>
            <ButtonIcon as={ExternalLink} />
          </Button>
        )}
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
  // //////////////////////////////////////////////////
  // altrimenti -> transazione onchain
  //    se !createdAt -> transazione non confermata
  //    altrimenti -> transazione confermata
  //        se settled -> transazione ramp
  //
}
