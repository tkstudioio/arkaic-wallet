import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";

import { Text } from "@/components/ui/text";
import { TxType } from "@arkade-os/sdk";
import { useTheme } from "@react-navigation/native";

import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useTransactions } from "@/hooks/use-transactions";
import useProfileStore from "@/stores/profile";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { isEmpty, map } from "lodash";
import { Minus, Plus } from "lucide-react-native";
import { useEffect } from "react";
import { match } from "ts-pattern";

export function TransactionsHistory() {
  const { colors } = useTheme();
  const { wallet } = useProfileStore();
  const queryClient = useQueryClient();

  const transactionsQuery = useTransactions();

  function refreshBalanceAndTransactions() {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["transactions-history"] });
  }

  useEffect(() => {
    if (!wallet) return;
    wallet.notifyIncomingFunds(refreshBalanceAndTransactions);
  }, []);

  return (
    <Card>
      <VStack space={"xl"}>
        {match(transactionsQuery)
          .with({ isSuccess: true }, ({ data, isLoading }) => {
            if (isLoading) {
              return <Spinner />;
            }
            if (isEmpty(data)) {
              return <Text className='text-center'>No transactions</Text>;
            }
            return map(data, (transaction, idx) => (
              <HStack key={idx} className='items-start justify-between'>
                <VStack>
                  <Heading size={"sm"}>
                    {transaction.createdAt ? (
                      format(transaction.createdAt, "dd/MM/yyyy")
                    ) : (
                      <Spinner />
                    )}
                  </Heading>
                  {transaction.createdAt && (
                    <Text>{format(transaction.createdAt, "HH:mm")}</Text>
                  )}
                </VStack>
                <HStack space={"xs"} className='items-center justify-end '>
                  {transaction.type === TxType.TxReceived ? (
                    <Plus color={colors.text} size={14} />
                  ) : (
                    <Minus color={colors.text} size={14} />
                  )}
                  <Heading>
                    {Intl.NumberFormat("it-IT").format(transaction.amount)}
                  </Heading>
                  <Text size={"xs"}>SATS</Text>
                </HStack>
              </HStack>
            ));
          })
          .with({ isLoading: true }, () => <Spinner />)
          .otherwise(({ error }) => {
            return <Text>Something went wrong</Text>;
          })}
      </VStack>
    </Card>
  );
}
