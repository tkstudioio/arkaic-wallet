import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import {
  CLTVMultisigTapscript,
  MultisigTapscript,
  VtxoScript,
} from "@arkade-os/sdk";
import { hex } from "@scure/base";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { subMinutes } from "date-fns";

export function useBuyProduct() {
  const { wallet, arkProvider } = useAccountStore();
  return useMutation({
    mutationKey: ["buy-product"],
    mutationFn: async (product: Product) => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");

      const sellerPubkeyBytes = hex.decode(product.sellerPubkey);
      const sellerPubkey =
        sellerPubkeyBytes.length === 33
          ? sellerPubkeyBytes.slice(1)
          : sellerPubkeyBytes;

      const buyerPubkeyBytes = await wallet.identity.compressedPublicKey();
      const buyerPubkey =
        buyerPubkeyBytes.length === 33
          ? buyerPubkeyBytes.slice(1)
          : buyerPubkeyBytes;

      const timelockExpiry = Math.floor(
        subMinutes(new Date(), 5).getTime() / 1000,
      );
      const info = await arkProvider.getInfo();
      const serverPubkeyBytes = hex.decode(info.signerPubkey);
      const serverPubkey =
        serverPubkeyBytes.length === 33
          ? serverPubkeyBytes.slice(1)
          : serverPubkeyBytes;

      const refundPath = CLTVMultisigTapscript.encode({
        pubkeys: [buyerPubkey, serverPubkey],
        absoluteTimelock: BigInt(timelockExpiry),
      }).script;

      const collaborativePath = MultisigTapscript.encode({
        pubkeys: [buyerPubkey, sellerPubkey, serverPubkey],
      }).script;

      const escrowScript = new VtxoScript([refundPath, collaborativePath]);
      const escrowAddress = escrowScript.address("tark", serverPubkey).encode();

      await wallet.sendBitcoin({
        address: escrowAddress,
        amount: product.prezzo,
      });

      const { data } = await axios.get(
        `http://localhost:3000/products/${product.id}/check-payment`,
        {
          params: {
            buyerPubkey: hex.encode(buyerPubkey),
            timelockExpiry,
          },
        },
      );

      return data;
    },
    onError: (err) => console.log(err),
  });
}
