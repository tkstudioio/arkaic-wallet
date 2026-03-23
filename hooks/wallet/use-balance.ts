import useAccountStore from "@/stores/account";
import { useQuery } from "@tanstack/react-query";

export function useBalance() {
  const { wallet } = useAccountStore();

  return useQuery({
    refetchInterval: 30 * 1000,
    queryKey: ["balance", wallet?.arkAddress],
    queryFn: () => {
      if (!wallet) throw new Error("missing wallet");
      return wallet.getBalance();
    },
    enabled: !!wallet,
    throwOnError: true,
  });
}
