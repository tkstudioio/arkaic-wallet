import useProfileStore from "@/stores/profile";
import { CreateLightningInvoiceResponse } from "@arkade-os/boltz-swap";
import { useMutation } from "@tanstack/react-query";
import { toNumber } from "lodash";

export function usePaymentAddress() {
  const { wallet, arkadeLightning } = useProfileStore();
  return useMutation({
    mutationKey: ["payment-address"],
    mutationFn: async (amount: number | undefined) => {
      if (!wallet) throw new Error("Missing wallet");
      const boardingAddress = await wallet.getBoardingAddress();
      const arkAddress = await wallet.getAddress();
      const { signerPubkey } = await wallet.arkProvider.getInfo();

      const normalizedAmount = toNumber(amount?.toFixed(0));

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
          amount: toNumber(normalizedAmount.toFixed(0)),
          description: "",
        });
      }

      return { paymentAddress, lnInvoice };
    },
    onError: console.log,
  });
}
