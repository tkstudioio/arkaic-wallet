import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useSellerCollaborate() {
  const { wallet, arkProvider } = useAccountStore();
  return useMutation({
    mutationKey: ["collaborate"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");

      const { data } = await axios.get(
        `http://localhost:3000/products/${product.id}/collaborate-psbts`,
      );

      const { collaboratePsbt } = data;

      if (!collaboratePsbt) throw new Error("No collaborate PSBT");

      const psbtBytes = base64.decode(collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      // Step 1: Submit signed PSBT, get back checkpoint txs to co-sign
      const { data: collaborateData } = await axios.post(
        `http://localhost:3000/products/${product.id}/collaborate`,
        { signedPsbt },
      );

      const { signedCheckpointTxs } = collaborateData;

      // Step 2: Sign each checkpoint tx with seller key
      const sellerSignedCheckpoints = await Promise.all(
        signedCheckpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      // Step 3: Submit seller-signed checkpoints
      const { data: checkpointsData } = await axios.post(
        `http://localhost:3000/products/${product.id}/collaborate-checkpoints`,
        { signedCheckpointTxs: sellerSignedCheckpoints },
      );

      return checkpointsData;
    },
    onError: (err) => console.log(err),
  });
}
