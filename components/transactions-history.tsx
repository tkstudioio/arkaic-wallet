import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { Text } from "@/components/ui/text";

import { VStack } from "@/components/ui/vstack";
import { useTransactions } from "@/hooks/use-transactions";
import useProfileStore from "@/stores/profile";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, map } from "lodash";
import { useEffect } from "react";
import { match } from "ts-pattern";
import { TransactionRow } from "./transaction-row";
import { Heading } from "./ui/heading";

export function TransactionsHistory() {
  const transactionsQuery = useTransactions();
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
    <Card variant={"ghost"}>
      <VStack space={"4xl"}>
        {match(transactionsQuery)
          .with({ isSuccess: true }, ({ data }) => {
            if (!isEmpty(data)) {
              return map(data, (transaction, idx) => (
                <TransactionRow key={idx} transaction={transaction} />
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
