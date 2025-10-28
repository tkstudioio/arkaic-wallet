import { ArkTransaction, TxType } from "@arkade-os/sdk";

import useSettingsStore from "@/stores/settings";

import { useTransactions } from "@/hooks/use-transactions";
import { find, some } from "lodash";

import { format, formatDistanceToNowStrict } from "date-fns";
import { Link2, Minus, Plus } from "lucide-react-native";

import useBitcoinPrice from "@/hooks/use-bitcoin-price";
import { useMemo } from "react";
import { OnboardButton } from "./onboard-button";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function Transaction({ transaction }: { transaction: ArkTransaction }) {
  const { symbol } = useSettingsStore();
  const { data: exchangeRate } = useBitcoinPrice(symbol);

  const { detailedTransactions } = useSettingsStore();
  const { data: transactions, isPending: isOnboardingFunds } =
    useTransactions();
  const { commitmentTxid, arkTxid, boardingTxid } = transaction.key;

  const onchainTransaction = find(
    transactions,
    ({ key }) => arkTxid !== "" && key.boardingTxid === commitmentTxid
  );

  const arkTransaction = find(
    transactions,
    ({ key }) => key.commitmentTxid === boardingTxid
  );

  const hasOnboardableTransactions = some(
    transactions,
    (tx) => tx.createdAt && tx.type === "RECEIVED" && !tx.settled
  );

  const isExternalTransaction = !arkTransaction && !onchainTransaction;
  const shouldOnboard = !transaction.settled && hasOnboardableTransactions;

  const amount = useMemo(() => {
    if (!exchangeRate) return 0;
    return (exchangeRate.last / 100000000) * transaction.amount;
  }, [exchangeRate, transaction.amount]);

  return (
    <HStack className='justify-between'>
      <VStack className='items-start w-max' space='xs'>
        <HStack className='items-center' space={"sm"}>
          {transaction.type === TxType.TxSent ? (
            <Button
              size={"xl"}
              className='w-max py-0'
              variant={"link"}
              action='secondary'
              disabled
            >
              <ButtonIcon as={Minus} size={"sm"} />
              <ButtonText>
                {Intl.NumberFormat("it", { maximumFractionDigits: 2 }).format(
                  amount
                )}{" "}
                {symbol}
              </ButtonText>
            </Button>
          ) : (
            <OnboardButton>
              <Button
                size={"xl"}
                className='w-max py-0'
                variant={"link"}
                action='positive'
                disabled={shouldOnboard}
              >
                <ButtonIcon as={Plus} size={"sm"} />
                {isOnboardingFunds ? <Spinner /> : null}
                <ButtonText>
                  {Intl.NumberFormat("it", { maximumFractionDigits: 2 }).format(
                    amount
                  )}{" "}
                  {symbol}
                </ButtonText>
                {shouldOnboard ? <ButtonIcon as={Link2} size={"sm"} /> : null}
              </Button>
            </OnboardButton>
          )}
        </HStack>
        {detailedTransactions ? (
          <HStack space='sm'>
            {transaction.settled ? (
              !transaction.key.commitmentTxid ? (
                <Badge size={"sm"} action='info'>
                  <BadgeText>Settled</BadgeText>
                </Badge>
              ) : !isExternalTransaction ? (
                <Badge size={"sm"} action='warning'>
                  <BadgeText>Offboard</BadgeText>
                </Badge>
              ) : transaction.key.boardingTxid ? (
                <Badge size={"sm"} action='info'>
                  <BadgeText>boardingtxid</BadgeText>
                </Badge>
              ) : (
                <Badge size={"sm"} action='info'>
                  <BadgeText>Skibidi</BadgeText>
                </Badge>
              )
            ) : !hasOnboardableTransactions ? null : (
              <Badge size={"sm"} action='warning'>
                <BadgeText>Not settled</BadgeText>
              </Badge>
            )}
          </HStack>
        ) : null}
      </VStack>

      {transaction.createdAt ? (
        <VStack className='w-max items-end'>
          {detailedTransactions ? (
            <Text>{format(transaction.createdAt, "PP", {})}</Text>
          ) : (
            <Text>{formatDistanceToNowStrict(transaction.createdAt)}</Text>
          )}
          {detailedTransactions ? (
            <Text>{format(transaction.createdAt, "HH:mm", {})}</Text>
          ) : null}
        </VStack>
      ) : (
        <HStack className='items-center' space={"xs"}>
          <Spinner />
          <Text>Pending</Text>
        </HStack>
      )}
    </HStack>
  );
}
