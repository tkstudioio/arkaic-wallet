import useProfileStore from "@/stores/profile";
import { useQuery } from "@tanstack/react-query";

export function useVtxos() {
  const { wallet } = useProfileStore();
  return useQuery({
    queryKey: ["ark-transactions"],
    queryFn: async () => {
      if (!wallet) throw new Error("missing vtxo manager");
      return wallet.getVtxos();
    },
  });
}
