import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

// TODO: replace with actual API base URL
const API_BASE_URL = "http://localhost:3000";

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async (): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!id,
  });
}
