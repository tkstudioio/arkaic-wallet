import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Product, ProductChat } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useAccountSellingProducts() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["account-selling"],
    queryFn: async (): Promise<Product[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(`${API_BASE_URL}/account/selling`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch selling products");
      return response.json();
    },
    enabled: !!wallet,
  });
}

export function useAccountBuyingChats() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["account-buying"],
    queryFn: async (): Promise<ProductChat[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const response = await fetch(`${API_BASE_URL}/account/buying`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch buying chats");
      return response.json();
    },
    enabled: !!wallet,
  });
}
