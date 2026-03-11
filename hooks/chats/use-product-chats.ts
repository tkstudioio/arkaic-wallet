import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { ProductChat } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useProductChats(productId: number) {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["product-chats", productId],
    queryFn: async (): Promise<ProductChat[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/chats`,
        { headers },
      );
      if (!response.ok) throw new Error("Failed to fetch chats");
      return response.json();
    },
    enabled: !!productId && !!wallet,
  });
}
