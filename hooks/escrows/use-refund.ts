import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type RefundParams = {
  escrowAddress: string;
  chatId: number;
};

export function useRefund() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["refund"],
    mutationFn: async ({ escrowAddress }: RefundParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data: psbtData } = await backend.get(
        `/escrows/address/${escrowAddress}/refund/psbt`,
      );

      if (!psbtData.refundPsbt) throw new Error("No refund PSBT");

      const psbtBytes = base64.decode(psbtData.refundPsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      const { data: submitData } = await backend.post(
        `/escrows/address/${escrowAddress}/refund/submit-signed-psbt`,
        { signedPsbt },
      );

      const buyerSignedCheckpoints = await Promise.all(
        submitData.signedCheckpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      const { data } = await backend.post(
        `/escrows/address/${escrowAddress}/refund/finalize`,
        {
          arkTxid: submitData.arkTxid,
          signedCheckpointTxs: buyerSignedCheckpoints,
        },
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
