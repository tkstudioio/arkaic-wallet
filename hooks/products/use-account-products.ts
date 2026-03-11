import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// TODO: replace with actual API base URL

export function useAccountSellingProducts() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["account-products"],
    queryFn: async (): Promise<Product[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const pubkey = await getPubkeyHex(wallet);

      const { data } = await axios.get(
        `http://localhost:4000/account/selling`,
        {
          headers: { Authorization: `Bearer ${pubkey}` },
        },
      );

      return data;
    },
    enabled: !!wallet,
  });
}

export function useAccountBuyingProducts() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["account-products"],
    queryFn: async (): Promise<Product[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const pubkey = await getPubkeyHex(wallet);

      const { data } = await axios.get(`http://localhost:4000/account/buying`, {
        headers: { Authorization: `Bearer ${pubkey}` },
      });

      return data;
    },
    enabled: !!wallet,
  });
}
