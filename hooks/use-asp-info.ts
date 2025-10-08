import useProfileStore from "@/stores/profile";
import { useQuery } from "@tanstack/react-query";

export function useAspInfo() {
  const { wallet } = useProfileStore();
  return useQuery({
    queryKey: ["ark-transactions"],
    queryFn: async () => {
      if (!wallet) throw new Error("missing wallet");
      return await wallet.arkProvider.getInfo();
    },
  });
}
