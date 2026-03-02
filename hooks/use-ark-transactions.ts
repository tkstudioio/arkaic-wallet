import { useTransactions } from "@/hooks/use-transactions";
import { useMemo } from "react";
import { filter } from "lodash";

export function useArkTransactions() {
  const transactionsQuery = useTransactions();
  const data = useMemo(
    () =>
      filter(
        transactionsQuery.data,
        (transaction) => transaction.key.boardingTxid === ""
      ),
    [transactionsQuery.data]
  );
  return { ...transactionsQuery, data };
}
