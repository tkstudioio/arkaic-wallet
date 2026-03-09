import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useBuyerConfirmCollaborate() {
  const { wallet } = useAccountStore();
  return useMutation({
    mutationKey: ["buyer-confirm-collaborate"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await axios.get(
        `http://localhost:3000/products/${product.id}/collab-status`,
      );

      const { collaboratePsbt } = data;

      if (!collaboratePsbt) throw new Error("Seller has not signed yet");

      const psbtBytes = base64.decode(collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      const { data: confirmData } = await axios.post(
        `http://localhost:3000/products/${product.id}/confirm-collaborate`,
        { signedPsbt },
      );

      const { signedCheckpointTxs } = confirmData;

      // Sign each checkpoint with buyer key
      const buyerSignedCheckpoints = await Promise.all(
        signedCheckpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      const { data: checkpointsData } = await axios.post(
        `http://localhost:3000/products/${product.id}/buyer-sign-checkpoints`,
        { signedCheckpointTxs: buyerSignedCheckpoints },
      );

      return checkpointsData;
    },
    onError: (err) => console.log(err),
  });
}
