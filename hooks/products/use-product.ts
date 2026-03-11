import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { getPubkeyHex } from "@/utils/get-pubkey-hex";
import { useQuery } from "@tanstack/react-query";

// TODO: replace with actual API base URL
const API_BASE_URL = "http://localhost:4000";

export function useProduct(id: number) {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product> => {
      if (!wallet) throw new Error("Missing wallet");

      const pubkey = await getPubkeyHex(wallet);

      const response = await fetch(
        `${API_BASE_URL}/products/${id}?include=events`,
        {
          headers: { Authorization: `Bearer ${pubkey}` },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    refetchInterval: 1000,
    enabled: !!id && !!wallet,
  });
}
