import useAccountStore from "@/stores/account";
import { Ramps } from "@arkade-os/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useOnboardUtxos() {
  const { wallet, arkProvider } = useAccountStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["onboard-utxos"],
    mutationFn: async () => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");
      const info = await arkProvider.getInfo();
      const commitmentTxid = await new Ramps(wallet).onboard(info.fees);
      return commitmentTxid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
