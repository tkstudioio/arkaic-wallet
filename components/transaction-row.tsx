import { ArkTransaction, TxType } from "@arkade-os/sdk";
import { format } from "date-fns";

import * as Linking from "expo-linking";
import { entries, find } from "lodash";
import {
  ExternalLink,
  LinkIcon,
  Minus,
  Plus,
  Triangle,
  X,
} from "lucide-react-native";
import { match } from "ts-pattern";
import { Badge, BadgeIcon, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function TransactionRow({
  transaction,
}: {
  transaction: ArkTransaction;
}) {
  const txKey = find(entries(transaction.key), ([, txId]) => txId !== "");

  if (!txKey) return <Text>Invalid transaction</Text>;

  const [txType, txId] = txKey;

  return (
    <HStack key={txId} className='items-center justify-between'>
      <VStack space={"md"}>
        <VStack space={"xs"}>
          {!transaction.createdAt ? (
            <HStack className='items-center' space={"xs"}>
              <Spinner />
              <Text>Waiting onchain confirm</Text>
            </HStack>
          ) : (
            <Heading size={"sm"}>
              {format(transaction.createdAt, "dd/MM/yyyy")}
            </Heading>
          )}

          {!transaction.createdAt ? null : (
            <Text size={"sm"}>{format(transaction.createdAt, "HH:mm")}</Text>
          )}
        </VStack>

        <HStack>
          {match(txType)
            .with("boardingTxid", () => (
              <Badge size={"sm"} action={"warning"} className='gap-1 w-max'>
                <BadgeIcon as={LinkIcon} />
                <BadgeText>Onchain</BadgeText>
              </Badge>
            ))
            .with("commitmentTxid", "arkTxid", () => (
              <Badge size={"sm"} action={"success"} className='gap-1 w-max'>
                <BadgeIcon as={Triangle} />
                <BadgeText>Ark</BadgeText>
              </Badge>
            ))
            .otherwise(() => (
              <Badge size={"sm"} action={"error"} className='gap-1 w-max'>
                <BadgeIcon as={X} />
                <BadgeText>Unknown</BadgeText>
              </Badge>
            ))}
        </HStack>
      </VStack>

      <VStack className='items-end'>
        <Button
          disabled
          className='gap-1'
          size={"xl"}
          variant={"link"}
          action={
            transaction.type === TxType.TxReceived ? "positive" : "negative"
          }
        >
          {transaction.type === TxType.TxReceived ? (
            <ButtonIcon as={Plus} />
          ) : (
            <ButtonIcon as={Minus} />
          )}
          <ButtonText>
            {Intl.NumberFormat("it-IT").format(transaction.amount)} sats
          </ButtonText>
        </Button>
        {!transaction.key.arkTxid &&
        (transaction.key.boardingTxid || transaction.key.commitmentTxid) ? (
          <Button
            onPress={() =>
              Linking.openURL(
                `https://mempool.space/it/tx/${
                  transaction.key.boardingTxid || transaction.key.commitmentTxid
                }`
              )
            }
            variant={"link"}
            size={"xs"}
          >
            <ButtonText>Open on mempool</ButtonText>
            <ButtonIcon as={ExternalLink} />
          </Button>
        ) : null}
      </VStack>
    </HStack>
  );
}
