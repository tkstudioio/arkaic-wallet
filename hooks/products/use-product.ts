import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useProduct(id: number | string) {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/products/${id}?include=events`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    refetchInterval: 1000 * 15,
    enabled: !!id && !!wallet,
  });
}
