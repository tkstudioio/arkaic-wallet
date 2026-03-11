import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SellerSignCheckpointsParams = {
  escrowId: number;
  chatId: number;
};

export function useSellerSignCheckpoints() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["seller-sign-checkpoints"],
    mutationFn: async ({ escrowId }: SellerSignCheckpointsParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/seller-checkpoints`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to get seller checkpoints");
      const { checkpointTxs } = await response.json();

      if (!checkpointTxs) throw new Error("Checkpoints not ready yet");

      const signedCheckpoints = await Promise.all(
        checkpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      const submitResponse = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/seller-sign-checkpoints`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ signedCheckpointTxs: signedCheckpoints }),
        },
      );
      if (!submitResponse.ok)
        throw new Error("Failed to submit seller checkpoints");
      return submitResponse.json();
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
