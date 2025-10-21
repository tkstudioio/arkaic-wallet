import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { Text } from "@/components/ui/text";

import { VStack } from "@/components/ui/vstack";
import { useArkTransactions } from "@/hooks/use-ark-transactions";
import useProfileStore from "@/stores/profile";
import useSettingsStore from "@/stores/settings";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, map } from "lodash";
import { useEffect } from "react";
import { match } from "ts-pattern";
import { ArkTransactionRow } from "./ark-transaction-row";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Switch } from "./ui/switch";

export function ArkaicOperationsList() {
  const { detailedTransactions, toggleDetailedTransactions } =
    useSettingsStore();
  const transactionsQuery = useArkTransactions();
  const queryClient = useQueryClient();
  const { wallet } = useProfileStore();

  function refreshBalanceAndTransactions() {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions-history"] });
  }

  useEffect(() => {
    if (!wallet) return;
    wallet.notifyIncomingFunds(refreshBalanceAndTransactions);
  }, [wallet]);

  return (
    <Card size={"lg"} className='gap-8'>
      <HStack className='justify-between items-center'>
        <Heading>Arkaic operations</Heading>
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
        {match(transactionsQuery)
          .with({ isSuccess: true }, ({ data }) => {
            if (!isEmpty(data)) {
              return map(data, (transaction, idx) => (
                <>
                  <ArkTransactionRow
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
