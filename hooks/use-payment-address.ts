import useProfileStore from "@/stores/profile";
import { useMutation } from "@tanstack/react-query";

export function usePaymentAddress() {
  const { wallet } = useProfileStore();
  return useMutation({
    mutationKey: ["payment-address"],
    mutationFn: async (amount: number | undefined) => {
      if (!wallet) throw new Error("Missing wallet");
      const boardingAddress = await wallet.getBoardingAddress();
      const arkAddress = await wallet.getAddress();
      const { signerPubkey } = await wallet.arkProvider.getInfo();

      const paymentAddress = `bitcoin:${boardingAddress}?ark=${arkAddress}&signerPubkey=${signerPubkey}${
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
