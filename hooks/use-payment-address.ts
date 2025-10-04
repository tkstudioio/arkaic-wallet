import useProfileStore from "@/stores/wallet";
import { useMutation } from "@tanstack/react-query";

export function usePaymentAddress() {
  const { wallet } = useProfileStore();
  return useMutation({
    mutationKey: ["payment-address"],
    mutationFn: async (amount: number | undefined) => {
      const boardingAddress = await wallet?.getBoardingAddress();
      const arkAddress = await wallet?.getAddress();

      const paymentAddress = `bitcoin:${boardingAddress}?ark=${arkAddress}${
        amount
          ? `&amount=${Intl.NumberFormat("en", {
              minimumFractionDigits: 8,
            }).format(amount / 100000000)}`
          : ""
      }`;

      return paymentAddress;
    },
  });
}
