import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { useQuery } from "@tanstack/react-query";

// TODO: replace with actual API base URL
const API_BASE_URL = "http://localhost:4000";

export function useProducts() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const pubkey = await getPubkeyHex(wallet);

      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${pubkey}` },
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!wallet,
  });
}
