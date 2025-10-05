import useProfileStore from "@/stores/profile";
import { useQuery } from "@tanstack/react-query";
import { filter } from "lodash";

export function useArkTransactions() {
  const { wallet } = useProfileStore();
  return useQuery({
    queryKey: ["ark-transactions"],
    queryFn: async () => {
      if (!wallet) throw new Error("missing wallet");
      const transactions = await wallet.getTransactionHistory();
      return filter(
        transactions,
        (transaction) => transaction.key.boardingTxid !== ""
      );
    },
  });
}
