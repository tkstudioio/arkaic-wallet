import useProfileStore from "@/stores/profile";
import { ArkaicPayment } from "@/types/arkaic";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSendBitcoin() {
  const { wallet } = useProfileStore();
  const queryClient = useQueryClient();
  return useMutation<string | undefined, Error, ArkaicPayment>({
    mutationKey: ["send"],
    mutationFn: async (arkaicPayment) => {
      if (!arkaicPayment.amount) throw new Error("Missing transaction amount");
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
