import useProfileStore from "@/stores/wallet";
import { useQuery } from "@tanstack/react-query";

export function useTransactions() {
  const { wallet } = useProfileStore();
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!wallet) throw new Error("missing wallet");
      return await wallet.getTransactionHistory();
    },
  });
}
