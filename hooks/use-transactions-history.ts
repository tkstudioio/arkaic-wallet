import useProfileStore from "@/stores/wallet";
import { useQuery } from "@tanstack/react-query";

export function useTransactionsHistory() {
  const { wallet } = useProfileStore();
  return useQuery({
    queryKey: ["transactions-history"],
    queryFn: () => {
      if (!wallet) throw new Error("missing wallet");
      return wallet?.getTransactionHistory();
    },
    refetchOnMount: true,
  });
}
