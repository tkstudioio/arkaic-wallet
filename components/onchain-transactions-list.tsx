import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useOnchainTransactions } from "@/hooks/use-onchain-transactions";

import useSettingsStore from "@/stores/settings";
import { isEmpty, map } from "lodash";
import { match } from "ts-pattern";
import { OnchainTransactionRow } from "./onchain-transaction-row";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Switch } from "./ui/switch";
import { VStack } from "./ui/vstack";
export function OnchainTransactionsList() {
  const { detailedTransactions, toggleDetailedTransactions } =
    useSettingsStore();
  const onchainTransactionsQuery = useOnchainTransactions();

  return (
    <Card size={"lg"} className='gap-8'>
      <HStack className='justify-between items-center'>
        <Heading>Onchain operations</Heading>
        <HStack className='items-center justify-end'>
          <Text size='sm'>show details</Text>
          <Switch
            value={detailedTransactions}
            onToggle={toggleDetailedTransactions}
            size={"sm"}
          />
        </HStack>
      </HStack>
      <VStack space={detailedTransactions ? "2xl" : "lg"}>
        {match(onchainTransactionsQuery)
          .with({ isSuccess: true }, ({ data }) => {
            if (!isEmpty(data)) {
              return map(data, (transaction, idx) => (
                <>
                  <OnchainTransactionRow
                    key={idx + "1"}
                    transaction={transaction}
                  />
                </>
              ));
            }
            return (
              <VStack>
                <Heading className='text-center'>No transactions</Heading>
                <Text className='text-center'>
                  press &quot;receive&quot; to request a payment
                </Text>
              </VStack>
            );
          })
          .with({ isLoading: true }, () => <Spinner />)
          .otherwise(() => (
            <Text>Something went wrong</Text>
          ))}
      </VStack>
    </Card>
  );
}
