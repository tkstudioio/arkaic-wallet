import { backend } from "@/lib/api";
import useAccountStore from "@/stores/account";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
  const { token } = useAccountStore();

  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await backend.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return data;
    },
  });
}
