import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Escrow } from "@/types/product";
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

function toXOnly(bytes: Uint8Array): Uint8Array {
  return bytes.length === 33 ? bytes.slice(1) : bytes;
}

export function useFundEscrow() {
  const queryClient = useQueryClient();
  const { wallet, arkProvider } = useAccountStore();

  return useMutation({
    mutationKey: ["fund-escrow"],
    mutationFn: async ({ escrow, sellerPubkey }: FundEscrowParams) => {
      if (!wallet) throw new Error("Missing wallet");
      if (!arkProvider) throw new Error("Missing arkProvider");

      const headers = await getAuthHeaders(wallet);

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
        amount: escrow.value,
      });

      const response = await fetch(
        `${API_BASE_URL}/escrows/${escrow.id}/check-payment`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to check payment");
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["escrow", variables.escrow.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.escrow.chatId],
      });
    },
    onError: (err) => console.log(err),
  });
}
