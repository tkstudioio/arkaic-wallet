import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useOnchainTransactions } from "@/hooks/use-onchain-transactions";

import { filter, map } from "lodash";
import { match } from "ts-pattern";
import { TransactionRow } from "./transaction-row";
export function OnchainTransactionsList() {
  const onchainTransactionsQuery = useOnchainTransactions();

  return match(onchainTransactionsQuery)
    .with({ isPending: true }, () => <Spinner />)
    .with({ isError: true }, () => (
      <Text>Error fetching waiting onboard transactions</Text>
    ))
    .with({ isSuccess: true }, ({ data: onboardingTransactions }) => {
      const pendingTransactions = filter(
        onboardingTransactions,
        (transaction) => !transaction.createdAt
      );

      return (
        <Card variant={"ghost"}>
          {match(pendingTransactions)
            .with([], () => (
              <Text className='text-center'>
                No pending onchain transactions
              </Text>
            ))
            .otherwise((pendingTransactions) =>
              map(pendingTransactions, (transaction, idx) => (
                <TransactionRow key={idx} transaction={transaction} />
              ))
            )}
        </Card>
      );
    })

    .otherwise(() => undefined);
}
