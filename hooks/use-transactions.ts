import useAccountStore from "@/stores/account";
import { useQuery } from "@tanstack/react-query";

export function useTransactions() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["transactions", wallet?.arkAddress],
    queryFn: async () => {
      if (!wallet) throw new Error("missing wallet");
      const transactions = await wallet.getTransactionHistory();
      return transactions;
    },
  });
}
