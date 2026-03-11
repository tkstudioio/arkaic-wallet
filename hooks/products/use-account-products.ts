import useAccountStore from "@/stores/account";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useAccountSellingProducts() {
  const { wallet } = useAccountStore();

  return useQuery({
    queryKey: ["account-products"],
    queryFn: async (): Promise<Product[]> => {
      if (!wallet) throw new Error("Missing wallet");

      const headers = await getAuthHeaders(wallet);

      const { data } = await axios.get(
        `${API_BASE_URL}/account/selling`,
        { headers },
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

      const headers = await getAuthHeaders(wallet);

      const { data } = await axios.get(`${API_BASE_URL}/account/buying`, {
        headers,
      });

      return data;
    },
    enabled: !!wallet,
  });
}
