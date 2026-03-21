import { Spinner } from "@/components/ui/spinner";

import { VStack } from "@/components/ui/vstack";
import { useTransactions } from "@/hooks/wallet/use-transactions";
import useAccountStore from "@/stores/account";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, join, map, values } from "lodash";
import { useCallback, useEffect } from "react";
import { match } from "ts-pattern";
import { Transaction } from "./transaction";
import { Large, P } from "./ui/typography";

export function Transactions() {
  const { wallet, account } = useAccountStore();
  const transactionsQuery = useTransactions();
  const queryClient = useQueryClient();

  const refreshBalanceAndTransactions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [queryClient]);

  useEffect(() => {
    if (!wallet) return;
    const stopListening = wallet.notifyIncomingFunds(
      refreshBalanceAndTransactions,
    );
    return () => {
      stopListening.then(() => {});
    };
  }, [wallet, account, refreshBalanceAndTransactions]);

  return (
    <VStack space={"lg"}>
      {match(transactionsQuery)
        .with({ isSuccess: true }, ({ data }) => {
          if (!isEmpty(data)) {
            return map(data, (transaction) => (
              <Transaction
                transaction={transaction}
                key={join(values(transaction.key)) + transaction.createdAt}
              />
            ));
          }
          return (
            <VStack>
              <Large className='text-center'>No transactions</Large>
              <P className='text-center'>
                press &quot;receive&quot; to request a payment
              </P>
            </VStack>
          );
        })
        .with(
          { isLoading: true },
          { isFetching: true },
          { isPending: true },
          () => <Spinner />,
        )
        .otherwise(() => (
          <P>Something went wrong</P>
        ))}
    </VStack>
  );
}
