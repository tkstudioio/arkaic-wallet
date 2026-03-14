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
import { useSendBitcoin } from "../arkade/use-send-bitcoin";

type CreateEscrowParams = {
  chatId: number;

  sellerPubkey: string;
  timelockExpiry: number;
  price: number;
};

export function useCreateEscrow() {
  const queryClient = useQueryClient();
  const { arkProvider } = useAccountStore();
  const { pubkey } = useAccountStore();
  const sendPaymentMutation = useSendBitcoin();

  return useMutation({
    mutationKey: ["create-escrow"],
    mutationFn: async (values: CreateEscrowParams): Promise<string> => {
      const info = await arkProvider?.getInfo();
      if (!info) throw new Error("Missing singerPubkey");
      if (!pubkey) throw new Error("Missing pubkey");

      const { data: storedEscrow } = await backend.get<Escrow | null>(
        `/escrows/${values.chatId}`,
      );

      const buyerPubkey = toXOnly(hex.decode(pubkey));
      const sellerPubkey = toXOnly(hex.decode(values.sellerPubkey));
      const serverPubkey = toXOnly(hex.decode(info.signerPubkey));
      let timelockExpiry =
        storedEscrow?.timelockExpiry || values.timelockExpiry;

      const refundPath = CLTVMultisigTapscript.encode({
        pubkeys: [buyerPubkey, serverPubkey],
        absoluteTimelock: BigInt(timelockExpiry),
      }).script;

      const collaborativePath = MultisigTapscript.encode({
        pubkeys: [buyerPubkey, sellerPubkey, serverPubkey],
      }).script;

      const escrowScript = new VtxoScript([refundPath, collaborativePath]);
      const escrowAddress = escrowScript.address("tark", serverPubkey).encode();

      await sendPaymentMutation.mutateAsync(
        {
          arkAddress: escrowAddress,
          amount: values.price,
          signerPubkey: info.signerPubkey,
        },
        { onError: console.log, onSuccess: console.log },
      );

      await backend.post(`/escrows/${values.chatId}`, {
        ...values,
        timelockExpiry,
        escrowAddress,
        serverPubkey: info.signerPubkey,
      });

      return escrowAddress;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat", variables.chatId] });
      queryClient.invalidateQueries({
        queryKey: ["active-offer", variables.chatId],
      });
    },
  });
}
