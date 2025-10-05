import useProfileStore from "@/stores/profile";
import { Ramps } from "@arkade-os/sdk";
import { useMutation } from "@tanstack/react-query";

export function useOnboardUtxos() {
  const { wallet } = useProfileStore();
  return useMutation({
    mutationKey: ["onboard-utxos"],
    mutationFn: async () => {
      if (!wallet) throw new Error("Missing wallet");
      const commitmentTxid = await new Ramps(wallet).onboard();
      return commitmentTxid;
    },
  });
}
