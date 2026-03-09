import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useSellerSignCollaborate() {
  const { wallet } = useAccountStore();
  return useMutation({
    mutationKey: ["seller-sign-collaborate"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");

      const { data } = await axios.get(
        `http://localhost:3000/products/${product.id}/collaborate-psbts`,
      );

      const { collaboratePsbt } = data;

      if (!collaboratePsbt) throw new Error("No collaborate PSBT");

      const psbtBytes = base64.decode(collaboratePsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      const { data: collaborateData } = await axios.post(
        `http://localhost:3000/products/${product.id}/collaborate`,
        { signedPsbt },
      );

      return collaborateData;
    },
    onError: (err) => console.log(err),
  });
}
