import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SellerSignCollaborateParams = {
  escrowId: number;
  chatId: number;
};

export function useSellerSignCollaborate() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["seller-sign-collaborate"],
    mutationFn: async ({ escrowId }: SellerSignCollaborateParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/seller-psbt`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to get seller PSBT");
      const { collaboratePsbt } = await response.json();

      if (!collaboratePsbt) throw new Error("No collaborate PSBT");

      const psbtBytes = base64.decode(collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      const submitResponse = await fetch(
        `${API_BASE_URL}/escrows/${escrowId}/collaborate/seller-submit-psbt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ signedPsbt }),
        },
      );
      if (!submitResponse.ok) throw new Error("Failed to submit seller PSBT");
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
