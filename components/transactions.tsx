import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { Text } from "@/components/ui/text";

import { VStack } from "@/components/ui/vstack";
import { useTransactions } from "@/hooks/use-transactions";
import useProfileStore from "@/stores/profile";
import useSettingsStore from "@/stores/settings";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, join, map, values } from "lodash";
import { useEffect } from "react";
import { match } from "ts-pattern";
import { Transaction } from "./transaction";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Switch } from "./ui/switch";

export function Transactions() {
  const { detailedTransactions, toggleDetailedTransactions } =
    useSettingsStore();
  const { wallet, account } = useProfileStore();
  const transactionsQuery = useTransactions();
  const queryClient = useQueryClient();

  function refreshBalanceAndTransactions() {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }

  useEffect(() => {
    console.log(account?.name);
    transactionsQuery.refetch();
    if (!wallet) return;
    wallet.notifyIncomingFunds(refreshBalanceAndTransactions);
  }, [wallet, account]);

  return (
    <Card size={"lg"} className='gap-8'>
      <HStack className='justify-between items-center'>
        <Heading>Transactions</Heading>
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
              return map(data, (transaction) => (
                <Transaction
                  key={join(values(transaction.key)) + transaction.createdAt}
                  transaction={transaction}
                />
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
          .with(
            { isLoading: true },
            { isFetching: true },
            { isPending: true },
            () => <Spinner />
          )
          .otherwise(() => (
            <Text>Something went wrong</Text>
          ))}
      </VStack>
    </Card>
  );
}
