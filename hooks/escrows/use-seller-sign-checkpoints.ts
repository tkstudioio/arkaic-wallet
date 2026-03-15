import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SellerSignCheckpointsParams = {
  escrowAddress: string;
  chatId: number;
};

export function useSellerSignCheckpoints() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["seller-sign-checkpoints"],
    mutationFn: async ({ escrowAddress }: SellerSignCheckpointsParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data: cpData } = await backend.get(
        `/escrows/address/${escrowAddress}/collaborate/seller-checkpoints`,
      );

      if (!cpData.checkpointTxs) throw new Error("Checkpoints not ready yet");

      const signedCheckpoints = await Promise.all(
        cpData.checkpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      const { data } = await backend.post(
        `/escrows/address/${escrowAddress}/collaborate/seller-sign-checkpoints`,
        { signedCheckpointTxs: signedCheckpoints },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
      queryClient.invalidateQueries({
        queryKey: ["escrow", variables.escrowAddress],
      });
    },
    onError: (err: Error) => console.error(err.message),
  });
}
