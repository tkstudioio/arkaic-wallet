import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useBuyerCollaborate() {
  const { wallet, arkProvider } = useAccountStore();
  return useMutation({
    mutationKey: ["collaborate"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");

      const { data } = await axios.get(
        `http://localhost:3000/products/${product.id}/collab-status`,
      );

      const { collaboratePsbt } = data;

      if (!collaboratePsbt) throw new Error("No collaborate PSBT");

      const psbtBytes = base64.decode(collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      // Submit signed PSBT — server handles finalization
      const { data: confirmData } = await axios.post(
        `http://localhost:3000/products/${product.id}/confirm-collaborate`,
        { signedPsbt },
      );

      return confirmData;
    },
    onError: (err) => console.log(err),
  });
}
