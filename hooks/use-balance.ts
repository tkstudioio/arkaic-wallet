import useProfileStore from "@/stores/profile";
import { Wallet } from "@arkade-os/sdk";
import { useQuery } from "@tanstack/react-query";

export function useBalance(passedWallet?: Wallet) {
  const { wallet: storedWallet } = useProfileStore();

  const wallet = passedWallet || storedWallet;
  return useQuery({
    queryKey: ["balance", wallet?.arkAddress],
    queryFn: () => {
      if (!wallet) throw new Error("missing wallet");
      return wallet?.getBalance();
    },
  });
}
