import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type BuyerConfirmCollaborateParams = {
  escrowId: number;
  chatId: number;
};

export function useBuyerConfirmCollaborate() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["buyer-confirm-collaborate"],
    mutationFn: async ({ escrowId }: BuyerConfirmCollaborateParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      // Get buyer PSBT
      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/buyer-psbt`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to get buyer PSBT");
      const { collaboratePsbt } = await response.json();

      if (!collaboratePsbt) throw new Error("Seller has not signed yet");

      // Sign PSBT
      const psbtBytes = base64.decode(collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      // Submit signed PSBT
      const submitResponse = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/buyer-submit-psbt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ signedPsbt }),
        },
      );
      if (!submitResponse.ok) throw new Error("Failed to submit buyer PSBT");
      const { signedCheckpointTxs } = await submitResponse.json();

      // Sign each checkpoint with buyer key
      const buyerSignedCheckpoints = await Promise.all(
        signedCheckpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      // Submit buyer-signed checkpoints
      const checkpointsResponse = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/buyer-sign-checkpoints`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ signedCheckpointTxs: buyerSignedCheckpoints }),
        },
      );
      if (!checkpointsResponse.ok)
        throw new Error("Failed to submit buyer checkpoints");
      return checkpointsResponse.json();
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
