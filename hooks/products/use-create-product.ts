import { Product } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// TODO: replace with actual API base URL
const API_BASE_URL = "http://localhost:3000";

type CreateProductParams = {
  nome: string;
  prezzo: number;
  sellerPubkey: string;
};

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: async (params: CreateProductParams): Promise<Product> => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
