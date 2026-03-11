import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useRefund() {
  const { wallet, arkProvider } = useAccountStore();
  return useMutation({
    mutationKey: ["refund"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");

      const pubkey = await getPubkeyHex(wallet);
      const authHeaders = { Authorization: `Bearer ${pubkey}` };

      const { data } = await axios.get(
        `http://localhost:4000/products/${product.id}/refund/psbt`,
        { headers: authHeaders },
      );

      const { refundPsbt } = data;

      if (!refundPsbt) throw new Error("No refund PSBT");

      const psbtBytes = base64.decode(refundPsbt);
      const tx = Transaction.fromPSBT(psbtBytes);
      const signedTx = await wallet.identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      // Step 1: Submit signed PSBT, get back checkpoint txs to co-sign
      const { data: refundData } = await axios.post(
        `http://localhost:4000/products/${product.id}/refund/submit-signed-psbt`,
        { signedPsbt },
        { headers: authHeaders },
      );

      const { arkTxid, signedCheckpointTxs } = refundData;

      // Step 2: Sign each checkpoint tx with buyer key
      const buyerSignedCheckpoints = await Promise.all(
        signedCheckpointTxs.map(async (cp: string) => {
          const cpBytes = base64.decode(cp);
          const cpTx = Transaction.fromPSBT(cpBytes);
          const signedCp = await wallet.identity.sign(cpTx);
          return base64.encode(signedCp.toPSBT());
        }),
      );

      // Step 3: Finalize refund with buyer-signed checkpoints
      const { data: finalizeData } = await axios.post(
        `http://localhost:4000/products/${product.id}/refund/finalize`,
        { arkTxid, signedCheckpointTxs: buyerSignedCheckpoints },
        { headers: authHeaders },
      );

      return finalizeData;
    },
    onError: (err) => console.log(err),
  });
}
