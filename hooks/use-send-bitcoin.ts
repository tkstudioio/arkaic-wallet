import useProfileStore from "@/stores/profile";
import { ArkaicPayment } from "@/types/arkaic";
import { Ramps } from "@arkade-os/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAspInfo } from "./use-asp-info";

export function useSendBitcoin() {
  const { wallet, arkadeLightning } = useProfileStore();
  const { data: aspInfo } = useAspInfo();
  const queryClient = useQueryClient();
  return useMutation<string | undefined, Error, ArkaicPayment>({
    mutationKey: ["send"],
    mutationFn: async (arkaicPayment) => {
      if (!wallet) throw new Error("No wallet set");

      console.log(arkaicPayment);
      if (arkaicPayment.lightningInvoice) {
        console.log(arkaicPayment.lightningInvoice);
        if (!arkadeLightning) throw new Error("No arkade lightning provider");
        const paymentResult = await arkadeLightning.sendLightningPayment({
          invoice: arkaicPayment.lightningInvoice,
        });

        return paymentResult.txid;
      }

      if (!arkaicPayment.amount) throw new Error("Missing transaction amount");
      if (!arkaicPayment.onchainAddress)
        throw new Error("Wrong address parsing");

      // onchain payment (asp is different or no ark address is provided)
      if (
        !arkaicPayment.signerPubkey ||
        !arkaicPayment.arkAddress ||
        arkaicPayment.signerPubkey !== aspInfo?.signerPubkey
      ) {
        return await new Ramps(wallet).offboard(
          arkaicPayment.onchainAddress,
          BigInt(arkaicPayment.amount)
        );
      }

      // ark payment (asp is the same and ark address is provided)
      return await wallet?.sendBitcoin({
        address: arkaicPayment.arkAddress,
        amount: arkaicPayment.amount,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

// bc1p3f7rzsl560gc7tz2xhnsy657sc9ualgnr7q92ukzum380wclp6gq22w9sp
