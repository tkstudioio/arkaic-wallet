import useProfileStore from "@/stores/profile";
import { ArkaicPayment } from "@/types/arkaic";
import { BitcoinLayer } from "@/types/common";
import { Ramps } from "@arkade-os/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendBitcoin() {
  const { wallet } = useProfileStore();
  const queryClient = useQueryClient();
  return useMutation<string | undefined, Error, ArkaicPayment>({
    mutationKey: ["send"],
    mutationFn: async (arkaicPayment) => {
      if (!wallet) throw new Error("No wallet set");
      if (!arkaicPayment.amount) throw new Error("Missing transaction amount");

      if (arkaicPayment.layer === BitcoinLayer.Onchain) {
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
