import useAccountStore from "@/stores/account";
import { ArkaicPayment } from "@/types/arkaic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAspInfo } from "../use-asp-info";

export function useSendBitcoin() {
  const { wallet, arkadeLightning } = useAccountStore();
  const { data: aspInfo } = useAspInfo();
  const queryClient = useQueryClient();
  return useMutation<string | undefined, Error, ArkaicPayment>({
    mutationKey: ["send"],
    mutationFn: async (arkaicPayment) => {
      if (!wallet) throw new Error("Missing wallet");

      if (!arkaicPayment.amount) throw new Error("Missing amount");

      if (
        !arkaicPayment.lightningInvoice &&
        (!arkaicPayment.arkAddress ||
          arkaicPayment.signerPubkey !== aspInfo?.signerPubkey)
      )
        throw new Error("Unprocessable payment");

      if (
        arkaicPayment.arkAddress &&
        aspInfo?.signerPubkey === arkaicPayment.signerPubkey
      ) {
        await wallet?.sendBitcoin({
          address: arkaicPayment.arkAddress,
          amount: arkaicPayment.amount,
        });
        return;
      }

      if (!arkadeLightning || !arkaicPayment.lightningInvoice)
        throw new Error("Unprocessable lightning swap");
      const paymentResult = await arkadeLightning.sendLightningPayment({
        invoice: arkaicPayment.lightningInvoice,
      });

      return paymentResult.txid;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

