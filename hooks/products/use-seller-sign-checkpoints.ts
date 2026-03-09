import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useSellerSignCheckpoints() {
  const { wallet } = useAccountStore();
  return useMutation({
    mutationKey: ["seller-sign-checkpoints"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await axios.get(
        `http://localhost:3000/products/${product.id}/collab-checkpoints`,
      );

      const { checkpointTxs } = data;

      if (!checkpointTxs) throw new Error("Checkpoints not ready yet");

      const signedCheckpoints = await Promise.all(
        checkpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      const { data: checkpointsData } = await axios.post(
        `http://localhost:3000/products/${product.id}/collaborate-checkpoints`,
        { signedCheckpointTxs: signedCheckpoints },
      );

      return checkpointsData;
    },
    onError: (err) => console.log(err),
  });
}
