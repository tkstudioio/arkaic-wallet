import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
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

      const pubkey = await getPubkeyHex(wallet);
      const authHeaders = { Authorization: `Bearer ${pubkey}` };

      const { data } = await axios.get(
        `http://localhost:4000/products/${product.id}/collaborate/seller-checkpoints`,
        { headers: authHeaders },
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
        `http://localhost:4000/products/${product.id}/collaborate/seller-sign-checkpoints`,
        { signedCheckpointTxs: signedCheckpoints },
        { headers: authHeaders },
      );

      return checkpointsData;
    },
    onError: (err) => console.log(err),
  });
}
