import useProfileStore from "@/stores/profile";
import { ArkaicPayment } from "@/types/arkaic";
import { BitcoinLayer } from "@/types/common";
import { Ramps } from "@arkade-os/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAspInfo } from "./use-asp-info";

export function useSendBitcoin() {
  const { wallet } = useProfileStore();
  const { data: aspInfo } = useAspInfo();
  const queryClient = useQueryClient();
  return useMutation<string | undefined, Error, ArkaicPayment>({
    mutationKey: ["send"],
    mutationFn: async (arkaicPayment) => {
      if (!wallet) throw new Error("No wallet set");
      if (!arkaicPayment.amount) throw new Error("Missing transaction amount");

      console.log(arkaicPayment);
      if (
        arkaicPayment.layer === BitcoinLayer.Onchain ||
        arkaicPayment.signerPubkey !== aspInfo?.signerPubkey
      ) {
        return await new Ramps(wallet).offboard(
          arkaicPayment.address,
          BigInt(arkaicPayment.amount)
        );
      }

      return await wallet?.sendBitcoin({
        address: arkaicPayment.address,
        amount: arkaicPayment.amount,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

// bc1p3f7rzsl560gc7tz2xhnsy657sc9ualgnr7q92ukzum380wclp6gq22w9sp
