import useProfileStore from "@/stores/wallet";
import { Ramps } from "@arkade-os/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useOnboardUtxos() {
  const queryClient = useQueryClient();
  const { wallet } = useProfileStore();
  return useMutation({
    mutationKey: ["onboard-utxos"],
    mutationFn: async () => {
      if (!wallet) throw new Error("Missing wallet");
      const commitmentTxid = await new Ramps(wallet).onboard();
      return commitmentTxid;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["waiting-onboard-transactions"],
      }),
  });
}
