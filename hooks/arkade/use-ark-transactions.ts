import { useTransactions } from "@/hooks/arkade/use-transactions";
import { filter } from "lodash";
import { useMemo } from "react";

export function useArkTransactions() {
  const transactionsQuery = useTransactions();
  const data = useMemo(
    () =>
      filter(
        transactionsQuery.data,
        (transaction) => transaction.key.boardingTxid === "",
      ),
    [transactionsQuery.data],
  );
  return { ...transactionsQuery, data };
}
