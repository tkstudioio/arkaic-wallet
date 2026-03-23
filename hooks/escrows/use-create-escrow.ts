import { backend } from "@/lib/api";
import { toXOnly } from "@/lib/utils";
import useAccountStore from "@/stores/account";
import { Escrow } from "@/types/backend";
import {
  CLTVMultisigTapscript,
  MultisigTapscript,
  VtxoScript,
} from "@arkade-os/sdk";
import { hex } from "@scure/base";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSendBitcoin } from "@/hooks/wallet/use-send-bitcoin";

type CreateEscrowParams = {
  chatId: number;
  sellerPubkey: string;
  timelockExpiry: number;
  price: number;
};

export function useCreateEscrow() {
  const queryClient = useQueryClient();
  const { arkProvider, pubkey } = useAccountStore();
  const sendPaymentMutation = useSendBitcoin();

  return useMutation({
    mutationKey: ["create-escrow"],
    onError: (e: Error) => console.error(e.message),
    mutationFn: async (values: CreateEscrowParams): Promise<string> => {
      const info = await arkProvider?.getInfo();
      if (!info) throw new Error("Missing signerPubkey");
      if (!pubkey) throw new Error("Missing pubkey");

      let timelockExpiry: number | undefined;

      try {
        const { data: storedEscrow } = await backend.get<Escrow>(
          `/chats/${values.chatId}/escrow`,
        );

        timelockExpiry = storedEscrow.timelockExpiry;
      } catch {
        timelockExpiry = values.timelockExpiry;
      }

      const buyerPubkey = toXOnly(hex.decode(pubkey));
      const sellerPubkey = toXOnly(hex.decode(values.sellerPubkey));
      const serverPubkey = toXOnly(hex.decode(info.signerPubkey));

      const refundPath = CLTVMultisigTapscript.encode({
        pubkeys: [buyerPubkey, serverPubkey],
        absoluteTimelock: BigInt(timelockExpiry),
      }).script;

      const collaborativePath = MultisigTapscript.encode({
        pubkeys: [buyerPubkey, sellerPubkey, serverPubkey],
      }).script;

      const escrowScript = new VtxoScript([refundPath, collaborativePath]);
      const escrowAddress = escrowScript.address("tark", serverPubkey).encode();

      await Promise.all([
        backend.post(`/escrows/${values.chatId}`, {
          chatId: values.chatId,
          sellerPubkey: values.sellerPubkey,
          price: values.price,
          timelockExpiry,
          escrowAddress,
          serverPubkey: info.signerPubkey,
        }),

        sendPaymentMutation.mutateAsync({
          arkAddress: escrowAddress,
          amount: values.price,
          signerPubkey: info.signerPubkey,
        }),
      ]);

      return escrowAddress;
    },
    onSuccess: (_data, variables) => {
      queryClient.refetchQueries({ queryKey: ["chat", variables.chatId] });
      queryClient.refetchQueries({
        queryKey: ["chat-offer", variables.chatId],
      });
    },
  });
}
