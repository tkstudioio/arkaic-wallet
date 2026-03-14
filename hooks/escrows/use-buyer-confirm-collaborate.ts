import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type BuyerConfirmCollaborateParams = {
  escrowAddress: string;
  chatId: number;
};

export function useBuyerConfirmCollaborate() {
  const queryClient = useQueryClient();
  const { wallet } = useAccountStore();

  return useMutation({
    mutationKey: ["buyer-confirm-collaborate"],
    mutationFn: async ({ escrowAddress }: BuyerConfirmCollaborateParams) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data: psbtData } = await backend.get(
        `/escrows/address/${escrowAddress}/collaborate/buyer-psbt`,
      );

      if (!psbtData.collaboratePsbt)
        throw new Error("Seller has not signed yet");

      const psbtBytes = base64.decode(psbtData.collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      const { data: submitData } = await backend.post(
        `/escrows/address/${escrowAddress}/collaborate/buyer-submit-psbt`,
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
        `/escrows/address/${escrowAddress}/collaborate/buyer-sign-checkpoints`,
        { signedCheckpointTxs: buyerSignedCheckpoints },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
      queryClient.invalidateQueries({
        queryKey: ["escrow", variables.escrowAddress],
      });
    },
    onError: (err) => console.log(err),
  });
}
