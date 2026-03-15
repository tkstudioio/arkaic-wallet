import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type SellerSignCollaborateParams = {
  escrowAddress: string;
  chatId: number;
};

export function useSellerSignCollaborate() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["seller-sign-collaborate"],
    mutationFn: async ({ escrowAddress }: SellerSignCollaborateParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data: psbtData } = await backend.get(
        `/escrows/address/${escrowAddress}/collaborate/seller-psbt`,
      );

      if (!psbtData.collaboratePsbt) throw new Error("No collaborate PSBT");

      const psbtBytes = base64.decode(psbtData.collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      const { data } = await backend.post(
        `/escrows/address/${escrowAddress}/collaborate/seller-submit-psbt`,
        { signedPsbt },
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
