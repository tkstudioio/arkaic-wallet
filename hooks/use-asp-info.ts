import useAccountStore from "@/stores/account";
import { useQuery } from "@tanstack/react-query";

export function useAspInfo() {
  const { wallet } = useAccountStore();
  return useQuery({
    queryKey: ["asp-info", wallet?.arkAddress],
    queryFn: async () => {
      if (!wallet) throw new Error("missing wallet");
      return await wallet.arkProvider.getInfo();
    },
    enabled: !!wallet,
  });
}
