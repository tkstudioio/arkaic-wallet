import useProfileStore from "@/stores/profile";
import { useQuery } from "@tanstack/react-query";

export function useBalance() {
  const { wallet } = useProfileStore();

  return useQuery({
    queryKey: ["balance"],
    queryFn: () => {
      if (!wallet) throw new Error("missing wallet");
      return wallet?.getBalance();
    },
  });
}
