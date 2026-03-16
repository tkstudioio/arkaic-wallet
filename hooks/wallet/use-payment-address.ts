import useAccountStore from "@/stores/account";
import { CreateLightningInvoiceResponse } from "@arkade-os/boltz-swap";
import { useMutation } from "@tanstack/react-query";
export function usePaymentAddress() {
  const { wallet, arkadeLightning } = useAccountStore();
  return useMutation({
    mutationKey: ["payment-address"],
    mutationFn: async (amount: number | undefined) => {
      if (!wallet) throw new Error("Missing wallet");
      const boardingAddress = await wallet.getBoardingAddress();
      const arkAddress = await wallet.getAddress();
      const { signerPubkey } = await wallet.arkProvider.getInfo();

      const normalizedAmount = amount ? Math.round(amount) : 0;

      const paymentAddress = `bitcoin:${boardingAddress}?ark=${arkAddress}&signerPubkey=${signerPubkey}${
        normalizedAmount
          ? `&amount=${Intl.NumberFormat("en", {
              minimumFractionDigits: 8,
            }).format(normalizedAmount / 100000000)}`
          : ""
      }`;

      let lnInvoice: CreateLightningInvoiceResponse | undefined;
      if (normalizedAmount) {
        lnInvoice = await arkadeLightning?.createLightningInvoice({
          amount: normalizedAmount,
          description: "",
        });
      }

      return { paymentAddress, lnInvoice };
    },
    onError: (err: Error) => console.error(err.message),
  });
}
