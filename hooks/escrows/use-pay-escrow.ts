import useAccountStore from "@/stores/account";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSendBitcoin } from "@/hooks/wallet/use-send-bitcoin";
import { useAspInfo } from "@/hooks/use-asp-info";

type PayEscrowParams = {
  escrowAddress: string;
  price: number;
  chatId: number;
};

export function usePayEscrow() {
  const queryClient = useQueryClient();
  const { pubkey } = useAccountStore();
  const sendPaymentMutation = useSendBitcoin();
  const { data: aspInfo } = useAspInfo();

  return useMutation({
    mutationKey: ["pay-escrow"],
    onError: (e: Error) => console.error(e.message),
    mutationFn: async (values: PayEscrowParams) => {
      if (!pubkey) throw new Error("Missing pubkey");
      if (!aspInfo?.signerPubkey) throw new Error("Missing signerPubkey");

      await sendPaymentMutation.mutateAsync({
        arkAddress: values.escrowAddress,
        amount: values.price,
        signerPubkey: aspInfo.signerPubkey,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-escrow", variables.chatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["escrow", variables.escrowAddress],
      });
    },
  });
}
