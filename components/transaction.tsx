import { ArkTransaction, TxType } from "@arkade-os/sdk";

import useSettingsStore from "@/stores/settings";

import { format, formatDistanceToNowStrict } from "date-fns";
import { Link2, Minus, Plus } from "lucide-react-native";

import { Linking, TouchableOpacity } from "react-native";
import { AmountComponent } from "./amount";
import { OnboardButton } from "./onboard-button";
import { Badge, BadgeText } from "./ui/badge";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { Spinner } from "./ui/spinner";
import { Small } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function Transaction({ transaction }: { transaction: ArkTransaction }) {
  const { detailedTransactions } = useSettingsStore();
  const { commitmentTxid, arkTxid, boardingTxid } = transaction.key;

  const isOnchain = boardingTxid !== "";
  const isReceived = transaction.type === TxType.TxReceived;
  const shouldShowOnboard = isOnchain && isReceived && !transaction.settled;

  const mempoolTxid = isOnchain
    ? commitmentTxid || boardingTxid
    : commitmentTxid || arkTxid;

  function openExplorer() {
    if (mempoolTxid) {
      Linking.openURL(`https://mempool.space/it/tx/${mempoolTxid}`);
    }
  }

  const amountButton = (
    <Button
      className='w-max py-0'
      variant={"link"}
      action={transaction.type === TxType.TxSent ? "negative" : "positive"}
      disabled={shouldShowOnboard}
    >
      <ButtonIcon
        as={transaction.type === TxType.TxSent ? Minus : Plus}
        size={"sm"}
      />
      <ButtonText>
        <AmountComponent amount={transaction.amount} size='2xl' />
      </ButtonText>
      {shouldShowOnboard ? <ButtonIcon as={Link2} size={"sm"} /> : null}
    </Button>
  );

  return shouldShowOnboard ? (
    <OnboardButton>
      <HStack className='justify-between'>
        <VStack className='items-start flex-1' space='xs'>
          <HStack className='items-center' space={"sm"}>
            {amountButton}
          </HStack>
          {detailedTransactions ? (
            <TransactionBadges transaction={transaction} />
          ) : null}
        </VStack>
        <TimestampDisplay
          createdAt={transaction.createdAt}
          detailed={detailedTransactions}
          isOnchain={isOnchain}
        />
      </HStack>
    </OnboardButton>
  ) : (
    <TouchableOpacity onPress={openExplorer}>
      <HStack className='justify-between'>
        <VStack className='items-start flex-1' space='xs'>
          <HStack className='items-center' space={"sm"}>
            {amountButton}
          </HStack>
          {detailedTransactions ? (
            <TransactionBadges transaction={transaction} />
          ) : null}
        </VStack>
        <TimestampDisplay
          createdAt={transaction.createdAt}
          detailed={detailedTransactions}
          isOnchain={isOnchain}
        />
      </HStack>
    </TouchableOpacity>
  );
}

function TransactionBadges({ transaction }: { transaction: ArkTransaction }) {
  const isOnchain = transaction.key.boardingTxid !== "";
  const isReceived = transaction.type === TxType.TxReceived;

  if (!isOnchain) return null;

  return (
    <HStack space='sm'>
      <Badge size={"sm"} action='warning'>
        <BadgeText>Onchain</BadgeText>
      </Badge>

      {transaction.createdAt === 0 ? (
        <Badge size={"sm"} action='warning'>
          <BadgeText>Mempool</BadgeText>
        </Badge>
      ) : (
        <Badge size={"sm"} action='success'>
          <BadgeText>Confirmed</BadgeText>
        </Badge>
      )}

      {isReceived ? (
        transaction.settled ? (
          <Badge size={"sm"} action='success'>
            <BadgeText>Onboarded</BadgeText>
          </Badge>
        ) : (
          <Badge size={"sm"} action='warning'>
            <BadgeText>Not onboarded</BadgeText>
          </Badge>
        )
      ) : null}
    </HStack>
  );
}

function TimestampDisplay({
  createdAt,
  detailed,
  isOnchain,
}: {
  createdAt: number;
  detailed: boolean;
  isOnchain: boolean;
}) {
  if (createdAt === 0 && isOnchain) {
    return (
      <HStack className='items-center' space={"xs"}>
        <Spinner />
        <Small className='text-arkaic-muted'>Pending</Small>
      </HStack>
    );
  }

  if (createdAt === 0) {
    return null;
  }

  return (
    <VStack className='items-end w-max'>
      <Small className='text-arkaic-muted'>
        {detailed
          ? format(createdAt, "PP", {})
          : formatDistanceToNowStrict(createdAt)}
      </Small>
      {detailed ? (
        <Small className='text-arkaic-muted text-xs'>
          {format(createdAt, "HH:mm", {})}
        </Small>
      ) : null}
    </VStack>
  );
}
