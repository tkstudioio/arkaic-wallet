import useProfileStore from "@/stores/wallet";
import { useQuery } from "@tanstack/react-query";
import { filter } from "lodash";

export function useOnchainTransactions() {
  const { wallet } = useProfileStore();
  return useQuery({
    queryKey: ["onchain-transactions"],
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
