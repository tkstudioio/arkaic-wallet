import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(`${API_BASE_URL}/products`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!wallet,
  });
}
