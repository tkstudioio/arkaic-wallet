import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type RefundParams = {
  escrowId: number;
  chatId: number;
};

export function useRefund() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["refund"],
    mutationFn: async ({ escrowId }: RefundParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      // Get refund PSBT
      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/refund/psbt`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to get refund PSBT");
      const { refundPsbt } = await response.json();

      if (!refundPsbt) throw new Error("No refund PSBT");

      // Sign refund PSBT
      const psbtBytes = base64.decode(refundPsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      // Submit signed PSBT
      const submitResponse = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/refund/submit-signed-psbt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ signedPsbt }),
        },
      );
      if (!submitResponse.ok) throw new Error("Failed to submit refund PSBT");
      const { arkTxid, signedCheckpointTxs } = await submitResponse.json();

      // Sign each checkpoint tx with buyer key
      const buyerSignedCheckpoints = await Promise.all(
        signedCheckpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      // Finalize refund
      const finalizeResponse = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/refund/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            arkTxid,
            signedCheckpointTxs: buyerSignedCheckpoints,
          }),
        },
      );
      if (!finalizeResponse.ok) throw new Error("Failed to finalize refund");
      return finalizeResponse.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
      queryClient.invalidateQueries({
        queryKey: ["escrow", variables.escrowId],
      });
    },
    onError: (err) => console.log(err),
  });
}
