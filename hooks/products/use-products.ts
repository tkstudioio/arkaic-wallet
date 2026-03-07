import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

// TODO: replace with actual API base URL
const API_BASE_URL = "http://localhost:3000";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });
}
