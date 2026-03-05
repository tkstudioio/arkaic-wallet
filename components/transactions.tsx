import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { VStack } from "@/components/ui/vstack";
import { useTransactions } from "@/hooks/use-transactions";
import useAccountStore from "@/stores/account";
import useSettingsStore from "@/stores/settings";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, join, map, values } from "lodash";
import { useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import { match } from "ts-pattern";
import { Transaction } from "./transaction";
import { Divider } from "./ui/divider";
import { HStack } from "./ui/hstack";
import { Switch } from "./ui/switch";
import { Large, P, Small } from "./ui/typography";

export function Transactions() {
  const { detailedTransactions, toggleDetailedTransactions } =
    useSettingsStore();
  const { wallet, account } = useAccountStore();
  const transactionsQuery = useTransactions();
  const queryClient = useQueryClient();

  const refreshBalanceAndTransactions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }, [queryClient]);

  useEffect(() => {
    if (!wallet) return;
    wallet.notifyIncomingFunds(refreshBalanceAndTransactions);
  }, [wallet, account, refreshBalanceAndTransactions]);

  return (
    <Card size={"lg"} className='bg-arkaic-fill gap-4 flex-1'>
      <HStack className='justify-between items-center'>
        <Large>Transactions</Large>
        <HStack className='items-center justify-end'>
          <Small>show details</Small>
          <Switch
            value={detailedTransactions}
            onToggle={toggleDetailedTransactions}
            size={"sm"}
          />
        </HStack>
      </HStack>
      <Divider />
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={"lg"}>
          {match(transactionsQuery)
            .with({ isSuccess: true }, ({ data }) => {
              if (!isEmpty(data)) {
                return map(data, (transaction, index) => (
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
      </ScrollView>
    </Card>
  );
}
