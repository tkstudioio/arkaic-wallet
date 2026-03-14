import { backend } from "@/lib/api";
import { toXOnly } from "@/lib/utis";
import useAccountStore from "@/stores/account";
import { Escrow } from "@/types/backend";
import {
  CLTVMultisigTapscript,
  MultisigTapscript,
  VtxoScript,
} from "@arkade-os/sdk";
import { hex } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type FundEscrowParams = {
  escrow: Escrow;
  sellerPubkey: string;
};

export function useFundEscrow() {
  const queryClient = useQueryClient();
  const { wallet, arkProvider } = useAccountStore();

  return useMutation({
    mutationKey: ["fund-escrow"],
    mutationFn: async ({ escrow, sellerPubkey }: FundEscrowParams) => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");

      const sellerPubkeyBytes = hex.decode(sellerPubkey);
      const buyerPubkeyBytes = await wallet.identity.compressedPublicKey();
      const info = await arkProvider.getInfo();
      const serverPubkeyBytes = hex.decode(info.signerPubkey);

      const refundPath = CLTVMultisigTapscript.encode({
        pubkeys: [toXOnly(buyerPubkeyBytes), toXOnly(serverPubkeyBytes)],
        absoluteTimelock: BigInt(escrow.timelockExpiry),
      }).script;

      const collaborativePath = MultisigTapscript.encode({
        pubkeys: [
          toXOnly(buyerPubkeyBytes),
          toXOnly(sellerPubkeyBytes),
          toXOnly(serverPubkeyBytes),
        ],
      }).script;

      const escrowScript = new VtxoScript([refundPath, collaborativePath]);
      const escrowAddress = escrowScript
        .address("tark", toXOnly(serverPubkeyBytes))
        .encode();

      await wallet.sendBitcoin({
        address: escrowAddress,
        amount: escrow.price,
      });

      const { data } = await backend.get(
        `/escrows/${escrow.address}/check-payment`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["escrow", variables.escrow.address],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.escrow.chatId],
      });
    },
    onError: (err) => console.log(err),
  });
}
